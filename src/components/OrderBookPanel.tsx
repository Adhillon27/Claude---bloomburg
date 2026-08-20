import { useMemo } from 'react'
import type { Quote } from '../data/types'
import { generateOrderBook } from '../data/orderBook'
import { fmtPrice, fmtVolume } from '../data/format'

interface OrderBookPanelProps {
  quote: Quote | undefined
}

export function OrderBookPanel({ quote }: OrderBookPanelProps) {
  const book = useMemo(() => {
    if (!quote) return null
    return generateOrderBook(quote.bid, quote.ask, quote.last, quote.lastTickAt || quote.last)
  }, [quote])

  if (!quote || !book) {
    return <div className="empty-hint">No security selected.</div>
  }

  return (
    <div className="ob-wrap">
      <div className="ob-cols">
        <div className="ob-col">
          <div className="ob-col__title pos">BID</div>
          {book.bids.map((lvl, i) => (
            <div className="ob-row" key={i}>
              <span className="ob-bar ob-bar--bid" style={{ width: `${(lvl.size / book.maxSize) * 100}%` }} />
              <span className="ob-size">{fmtVolume(lvl.size)}</span>
              <span className="ob-price pos">{fmtPrice(lvl.price)}</span>
            </div>
          ))}
        </div>
        <div className="ob-col">
          <div className="ob-col__title neg">ASK</div>
          {book.asks.map((lvl, i) => (
            <div className="ob-row ob-row--ask" key={i}>
              <span className="ob-price neg">{fmtPrice(lvl.price)}</span>
              <span className="ob-size">{fmtVolume(lvl.size)}</span>
              <span className="ob-bar ob-bar--ask" style={{ width: `${(lvl.size / book.maxSize) * 100}%` }} />
            </div>
          ))}
        </div>
      </div>
      <div className="ob-spread">
        SPREAD {fmtPrice(quote.ask - quote.bid)} &middot; LAST {fmtPrice(quote.last)}
      </div>
    </div>
  )
}
