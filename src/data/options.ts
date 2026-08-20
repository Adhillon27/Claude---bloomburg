import { hashSeed, mulberry32 } from './rng'

export interface OptionQuote {
  bid: number
  ask: number
  volume: number
  oi: number
  iv: number
}

export interface OptionRow {
  strike: number
  call: OptionQuote
  put: OptionQuote
}

export interface OptionsExpiry {
  label: string
  daysOut: number
  rows: OptionRow[]
}

function strikeIncrement(spot: number): number {
  if (spot < 20) return 1
  if (spot < 100) return 2.5
  if (spot < 300) return 5
  if (spot < 1000) return 10
  return 25
}

function formatExpiry(daysOut: number): string {
  const d = new Date(Date.now() + daysOut * 86400_000)
  return d.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: '2-digit' }).toUpperCase().replace(/,/g, '')
}

/** Simplified, non-Black-Scholes synthetic pricer: plausible shape (smile, time decay), not a real model. */
export function generateOptionsChain(symbol: string, spot: number): OptionsExpiry[] {
  const seedRand = mulberry32(hashSeed(symbol + 'opt'))
  const baseIV = 0.22 + seedRand() * 0.35
  const increment = strikeIncrement(spot)
  const atmStrike = Math.round(spot / increment) * increment

  const expiries = [16, 44, 100]

  return expiries.map((daysOut) => {
    const rand = mulberry32(hashSeed(symbol + 'opt' + daysOut))
    const T = daysOut / 365
    const rows: OptionRow[] = []

    for (let i = -5; i <= 5; i++) {
      const strike = Math.max(increment, atmStrike + i * increment)
      const moneyness = (strike - spot) / spot
      const iv = Math.min(1.4, baseIV * (1 + 0.6 * Math.abs(moneyness)))
      const timeValue = spot * iv * Math.sqrt(T) * Math.exp(-((moneyness / 0.22) ** 2) / 2) * 0.4
      const callIntrinsic = Math.max(spot - strike, 0)
      const putIntrinsic = Math.max(strike - spot, 0)
      const atmWeight = Math.exp(-((moneyness / 0.15) ** 2) / 2)

      const buildQuote = (mid: number): OptionQuote => {
        const spreadPct = 0.04 + rand() * 0.05
        const half = Math.max(0.01, (mid * spreadPct) / 2)
        return {
          bid: Math.max(0.01, mid - half),
          ask: mid + half,
          volume: Math.round(rand() * 2800 * atmWeight),
          oi: Math.round(500 + rand() * 12000 * atmWeight),
          iv,
        }
      }

      rows.push({
        strike,
        call: buildQuote(callIntrinsic + timeValue),
        put: buildQuote(putIntrinsic + timeValue),
      })
    }

    return { label: formatExpiry(daysOut), daysOut, rows }
  })
}
