import { hashSeed, mulberry32 } from './rng'

export interface BookLevel {
  price: number
  size: number
}

export interface OrderBook {
  bids: BookLevel[]
  asks: BookLevel[]
  maxSize: number
}

/**
 * Derives a synthetic depth-of-book ladder from a quote's live bid/ask/last.
 * Reseeded off the quote's lastTickAt so the ladder redraws each time the
 * symbol ticks, without needing its own place in the mock data store.
 */
export function generateOrderBook(bid: number, ask: number, last: number, tickSeed: number, levels = 10): OrderBook {
  const rand = mulberry32((hashSeed('orderbook') ^ Math.floor(tickSeed * 1000)) >>> 0)
  const spread = ask - bid || last * 0.0008
  const tick = Math.max(0.01, spread / 3)

  const bids: BookLevel[] = []
  const asks: BookLevel[] = []
  for (let i = 0; i < levels; i++) {
    const decay = 1 - i / (levels + 2)
    bids.push({ price: bid - i * tick, size: Math.round((80 + rand() * 900) * decay) })
    asks.push({ price: ask + i * tick, size: Math.round((80 + rand() * 900) * decay) })
  }

  const maxSize = Math.max(...bids.map((b) => b.size), ...asks.map((a) => a.size))
  return { bids, asks, maxSize }
}
