import type { MarketDataSource } from './types'
import { createMockMarketDataSource } from './mockDataSource'

/**
 * Single entry point for market data. Everything above this file (hooks,
 * components) only ever sees the MarketDataSource interface, so swapping
 * mock data for a live provider means writing one function here — nothing
 * else in the app changes.
 *
 * To wire a live provider:
 *   1. Add VITE_DATA_PROVIDER=finnhub (or alphavantage/polygon/iex) and
 *      VITE_<PROVIDER>_API_KEY to a .env.local file (never commit real keys).
 *   2. Implement createLiveMarketDataSource() below to satisfy
 *      MarketDataSource using that provider's REST/WebSocket API.
 *   3. Keep the try/catch fallback so a missing key, network error, or
 *      rate-limit degrades to mock data instead of a blank screen.
 */
export function createMarketDataSource(): MarketDataSource {
  const provider = import.meta.env.VITE_DATA_PROVIDER as string | undefined

  if (provider && provider !== 'mock') {
    try {
      return createLiveMarketDataSource(provider)
    } catch (err) {
      console.warn(`[marketDataSource] live provider "${provider}" unavailable, falling back to mock:`, err)
      return createMockMarketDataSource()
    }
  }

  return createMockMarketDataSource()
}

function createLiveMarketDataSource(provider: string): MarketDataSource {
  // No live provider is wired yet — this repo ships with mock data only.
  // Implement a provider-specific adapter here (e.g. Finnhub quote + candle
  // + news endpoints) that returns an object satisfying MarketDataSource,
  // then remove this throw.
  throw new Error(`no live adapter implemented for provider "${provider}"`)
}
