export type Timeframe = '1D' | '5D' | '1M' | '6M' | '1Y'

export interface Quote {
  symbol: string
  name: string
  last: number
  prevClose: number
  chg: number
  chgPct: number
  bid: number
  ask: number
  volume: number
  dayLow: number
  dayHigh: number
  /** set transiently by the tick loop, consumed by the UI for the flash animation */
  direction: 'up' | 'down' | null
  lastTickAt: number
}

export interface Candle {
  time: number // unix seconds
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface NewsItem {
  id: string
  time: number
  headline: string
  source: string
  relevance: 'high' | 'medium' | 'low'
  symbols: string[]
}

export interface IndexQuote {
  symbol: string
  label: string
  last: number
  chg: number
  chgPct: number
  direction: 'up' | 'down' | null
}

export interface SecurityProfile {
  symbol: string
  name: string
  exchange: string
  sector: string
  description: string
}

/**
 * Isolation boundary: every consumer of market data goes through this
 * interface, never through a concrete source directly. Swap
 * createMockMarketDataSource() for a live implementation (Finnhub, Alpha
 * Vantage, Polygon, IEX, ...) without touching any component.
 */
export interface MarketDataSource {
  getWatchlistSymbols(): string[]
  getQuotes(): Quote[]
  getIndices(): IndexQuote[]
  getNews(): NewsItem[]
  getCandles(symbol: string, timeframe: Timeframe): Candle[]
  getProfile(symbol: string): SecurityProfile | undefined
  /** advance the simulation/poll one tick; returns true if anything changed */
  tick(): boolean
}
