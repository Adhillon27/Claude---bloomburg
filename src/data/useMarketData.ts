import { useEffect, useMemo, useRef, useState } from 'react'
import { createMarketDataSource } from './marketDataSource'
import type { Candle, IndexQuote, NewsItem, Quote, SecurityProfile, Timeframe } from './types'

export interface UseMarketDataResult {
  quotes: Quote[]
  indices: IndexQuote[]
  news: NewsItem[]
  getCandles: (symbol: string, timeframe: Timeframe) => Candle[]
  getProfile: (symbol: string) => SecurityProfile | undefined
}

const TICK_MIN_MS = 1000
const TICK_MAX_MS = 2000

export function useMarketData(): UseMarketDataResult {
  const source = useMemo(() => createMarketDataSource(), [])
  const [quotes, setQuotes] = useState<Quote[]>(() => source.getQuotes())
  const [indices, setIndices] = useState<IndexQuote[]>(() => source.getIndices())
  const [news, setNews] = useState<NewsItem[]>(() => source.getNews())
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    function scheduleTick() {
      const delay = TICK_MIN_MS + Math.random() * (TICK_MAX_MS - TICK_MIN_MS)
      timeoutRef.current = setTimeout(() => {
        source.tick()
        setQuotes(source.getQuotes())
        setIndices(source.getIndices())
        setNews(source.getNews())
        scheduleTick()
      }, delay)
    }
    scheduleTick()
    return () => clearTimeout(timeoutRef.current)
  }, [source])

  return {
    quotes,
    indices,
    news,
    getCandles: (symbol, timeframe) => source.getCandles(symbol, timeframe),
    getProfile: (symbol) => source.getProfile(symbol),
  }
}
