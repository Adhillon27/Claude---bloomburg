import type { Candle, IndexQuote, MarketDataSource, NewsItem, Quote, SecurityProfile, Timeframe } from './types'
import { DEFAULT_WATCHLIST, UNIVERSE } from './universe'
import { generateHistory, sliceForTimeframe } from './candles'
import { makeHeadline, seedNews } from './news'
import { mulberry32, noise, hashSeed } from './rng'

interface IndexSeed {
  symbol: string
  label: string
  base: number
  vol: number
}

const INDEX_SEEDS: IndexSeed[] = [
  { symbol: 'SPX', label: 'S&P 500', base: 6449.8, vol: 0.0009 },
  { symbol: 'NDX', label: 'NASDAQ 100', base: 23310.5, vol: 0.0012 },
  { symbol: 'DXY', label: 'DOLLAR IDX', base: 101.42, vol: 0.0006 },
  { symbol: 'US10Y', label: 'US 10Y YLD', base: 4.28, vol: 0.001 },
  { symbol: 'BTC', label: 'BTC-USD', base: 112450, vol: 0.0025 },
]

export function createMockMarketDataSource(): MarketDataSource {
  const histories = new Map<string, ReturnType<typeof generateHistory>>()
  const quotes = new Map<string, Quote>()
  const indices = new Map<string, IndexQuote>()
  const indexRand = new Map<string, () => number>()
  let news: NewsItem[] = seedNews(24)

  for (const entry of UNIVERSE) {
    const avgVolume = Math.round((5_000_000 / Math.sqrt(entry.basePrice)) * (0.6 + Math.random() * 0.8))
    const history = generateHistory(entry.symbol, entry.basePrice, avgVolume)
    histories.set(entry.symbol, history)
    const last = history.intraday1D[history.intraday1D.length - 1].close
    const prevClose = history.daily[history.daily.length - 1].open
    quotes.set(entry.symbol, {
      symbol: entry.symbol,
      name: entry.name,
      last,
      prevClose,
      chg: last - prevClose,
      chgPct: ((last - prevClose) / prevClose) * 100,
      bid: last - last * 0.0004,
      ask: last + last * 0.0004,
      volume: avgVolume,
      dayLow: Math.min(...history.intraday1D.map((c) => c.low)),
      dayHigh: Math.max(...history.intraday1D.map((c) => c.high)),
      direction: null,
      lastTickAt: 0,
    })
  }

  for (const seed of INDEX_SEEDS) {
    indexRand.set(seed.symbol, mulberry32(hashSeed(seed.symbol + 'idx')))
    indices.set(seed.symbol, {
      symbol: seed.symbol,
      label: seed.label,
      last: seed.base,
      chg: 0,
      chgPct: 0,
      direction: null,
    })
  }

  function getSector(symbol: string) {
    return UNIVERSE.find((u) => u.symbol === symbol)
  }

  return {
    getWatchlistSymbols() {
      return DEFAULT_WATCHLIST
    },

    getQuotes() {
      return Array.from(quotes.values())
    },

    getIndices() {
      return Array.from(indices.values())
    },

    getNews() {
      return news
    },

    getCandles(symbol: string, timeframe: Timeframe): Candle[] {
      const history = histories.get(symbol)
      if (!history) return []
      const sliced = sliceForTimeframe(history, timeframe)
      if (timeframe === '1D') {
        const q = quotes.get(symbol)
        if (q && sliced.length) {
          const last = sliced[sliced.length - 1]
          return [...sliced.slice(0, -1), { ...last, close: q.last, high: Math.max(last.high, q.last), low: Math.min(last.low, q.last) }]
        }
      }
      return sliced
    },

    getProfile(symbol: string): SecurityProfile | undefined {
      const entry = getSector(symbol)
      if (!entry) return undefined
      return {
        symbol: entry.symbol,
        name: entry.name,
        exchange: entry.exchange,
        sector: entry.sector,
        description: `${entry.name} (${entry.symbol} ${entry.exchange}) trades in the ${entry.sector} sector. Simulated reference data for terminal demo purposes.`,
      }
    },

    tick(): boolean {
      const now = Date.now() / 1000
      for (const [symbol, q] of quotes) {
        const rand = mulberry32((hashSeed(symbol) ^ Math.floor(now * 3)) >>> 0)
        if (rand() > 0.35) continue // not every symbol ticks every cycle
        const move = noise(rand) * 0.0015
        const newLast = Math.max(0.5, q.last * (1 + move))
        const direction: Quote['direction'] = newLast === q.last ? null : newLast > q.last ? 'up' : 'down'
        quotes.set(symbol, {
          ...q,
          last: newLast,
          chg: newLast - q.prevClose,
          chgPct: ((newLast - q.prevClose) / q.prevClose) * 100,
          bid: newLast - newLast * 0.0004,
          ask: newLast + newLast * 0.0004,
          volume: q.volume + Math.round(Math.abs(move) * 5_000_000),
          dayLow: Math.min(q.dayLow, newLast),
          dayHigh: Math.max(q.dayHigh, newLast),
          direction,
          lastTickAt: now,
        })
      }

      for (const seed of INDEX_SEEDS) {
        const rand = indexRand.get(seed.symbol)!
        const prev = indices.get(seed.symbol)!
        if (Math.random() > 0.5) continue
        const move = noise(rand) * seed.vol
        const newLast = prev.last * (1 + move)
        indices.set(seed.symbol, {
          ...prev,
          last: newLast,
          chg: newLast - seed.base,
          chgPct: ((newLast - seed.base) / seed.base) * 100,
          direction: newLast === prev.last ? null : newLast > prev.last ? 'up' : 'down',
        })
      }

      if (Math.random() < 0.18) {
        news = [makeHeadline(Math.floor(now)), ...news].slice(0, 60)
      }

      return true
    },
  }
}
