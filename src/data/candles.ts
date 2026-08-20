import type { Candle, Timeframe } from './types'
import { mulberry32, noise, hashSeed } from './rng'

const DAY = 86400
const TRADING_MINUTES = 390 // 6.5h session

function walk(rand: () => number, start: number, steps: number, volPct: number): number[] {
  const out: number[] = [start]
  let price = start
  for (let i = 0; i < steps; i++) {
    price = Math.max(0.5, price * (1 + noise(rand) * volPct))
    out.push(price)
  }
  return out
}

function toCandles(prices: number[], startTime: number, stepSeconds: number, rand: () => number, avgVolume: number): Candle[] {
  const candles: Candle[] = []
  for (let i = 0; i < prices.length - 1; i++) {
    const open = prices[i]
    const close = prices[i + 1]
    const high = Math.max(open, close) * (1 + rand() * 0.004)
    const low = Math.min(open, close) * (1 - rand() * 0.004)
    candles.push({
      time: startTime + i * stepSeconds,
      open,
      high,
      low,
      close,
      volume: Math.round(avgVolume * (0.4 + rand() * 1.2)),
    })
  }
  return candles
}

/**
 * Generates a full 1Y daily series plus a subdivided last day, all seeded
 * from the symbol so repeated calls are stable. Shorter timeframes are
 * derived by slicing/subdividing this one series, keeping the "close" price
 * consistent across every timeframe (as real historical data would be).
 */
export function generateHistory(symbol: string, basePrice: number, avgVolume: number) {
  const rand = mulberry32(hashSeed(symbol))
  const now = Math.floor(Date.now() / 1000)
  const todayStart = now - (now % DAY)

  const dailyPrices = walk(rand, basePrice * (0.75 + rand() * 0.1), 252, 0.018)
  const daily = toCandles(dailyPrices, todayStart - 252 * DAY, DAY, rand, avgVolume)

  const lastDailyClose = daily[daily.length - 1].close
  const intradayStep = Math.floor((TRADING_MINUTES * 60) / 78)
  const todayPrices = walk(rand, lastDailyClose, 78, 0.006)
  const intraday1D = toCandles(todayPrices, todayStart, intradayStep, rand, avgVolume / 78)

  const fiveDayPrices = walk(rand, daily[daily.length - 6]?.close ?? lastDailyClose, 130, 0.007)
  const intraday5D = toCandles(fiveDayPrices, todayStart - 5 * DAY, Math.floor((5 * TRADING_MINUTES * 60) / 130), rand, avgVolume / 26)

  return { daily, intraday1D, intraday5D }
}

export function sliceForTimeframe(
  history: ReturnType<typeof generateHistory>,
  timeframe: Timeframe,
): Candle[] {
  switch (timeframe) {
    case '1D':
      return history.intraday1D
    case '5D':
      return history.intraday5D
    case '1M':
      return history.daily.slice(-22)
    case '6M':
      return history.daily.slice(-126)
    case '1Y':
      return history.daily
  }
}
