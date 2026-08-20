import { useEffect, useState } from 'react'
import type { NewsItem } from '../data/types'
import { fmtNewsAge } from '../data/format'

interface NewsFeedProps {
  news: NewsItem[]
  onSymbolClick: (symbol: string) => void
  pulse?: boolean
}

export function NewsFeed({ news, onSymbolClick, pulse }: NewsFeedProps) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 5000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className={`panel panel--news ${pulse ? 'panel--pulse' : ''}`}>
      <div className="panel__header">
        <span>NEWS &amp; HEADLINES</span>
        <span className="panel__header-tag">TOP</span>
      </div>
      <div className="panel__body">
        <ul className="news-list">
          {news.map((item) => (
            <li key={item.id} className="news-item">
              <span className="news-item__time">{fmtNewsAge(item.time, now)}</span>
              <span className={`news-item__source news-item__source--${item.relevance}`}>{item.source}</span>
              <span
                className="news-item__headline"
                onClick={() => item.symbols[0] && onSymbolClick(item.symbols[0])}
                style={{ cursor: item.symbols.length ? 'pointer' : 'default' }}
              >
                {item.headline}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
