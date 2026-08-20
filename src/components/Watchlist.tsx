import { useEffect, useState } from 'react'
import type { Quote } from '../data/types'
import { fmtChg, fmtPct, fmtPrice, fmtVolume, signClass } from '../data/format'

interface WatchlistProps {
  quotes: Quote[]
  selectedSymbol: string | null
  onSelect: (symbol: string) => void
}

function useNow(intervalMs: number) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs)
    return () => clearInterval(id)
  }, [intervalMs])
  return now
}

export function Watchlist({ quotes, selectedSymbol, onSelect }: WatchlistProps) {
  const now = useNow(120)
  const [focusIndex, setFocusIndex] = useState(0)

  function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      const next = Math.min(focusIndex + 1, quotes.length - 1)
      setFocusIndex(next)
      onSelect(quotes[next].symbol)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      const next = Math.max(focusIndex - 1, 0)
      setFocusIndex(next)
      onSelect(quotes[next].symbol)
    } else if (e.key === 'Enter' && quotes[focusIndex]) {
      onSelect(quotes[focusIndex].symbol)
    }
  }

  return (
    <div className="panel panel--watchlist">
      <div className="panel__header">
        <span>QUOTE MONITOR</span>
        <span className="panel__header-tag">{quotes.length} TICKERS</span>
      </div>
      <div className="panel__body" tabIndex={0} onKeyDown={handleKeyDown}>
        <table className="wl-table">
          <thead>
            <tr>
              <th>TICKER</th>
              <th>LAST</th>
              <th>CHG</th>
              <th>CHG%</th>
              <th>BID</th>
              <th>ASK</th>
              <th>VOLUME</th>
              <th>RANGE</th>
            </tr>
          </thead>
          <tbody>
            {quotes.map((q, i) => {
              const sinceTick = now - q.lastTickAt * 1000
              const flashClass = q.direction && sinceTick >= 0 && sinceTick < 550 ? `flash-${q.direction}` : ''
              const isSelected = q.symbol === selectedSymbol
              return (
                <tr
                  key={q.symbol}
                  className={`wl-row ${isSelected ? 'wl-row--selected' : ''} ${i === focusIndex ? 'wl-row--focused' : ''} ${flashClass}`}
                  onClick={() => {
                    setFocusIndex(i)
                    onSelect(q.symbol)
                  }}
                >
                  <td>
                    <span className="wl-sym">{q.symbol}</span>
                    <span className="wl-name">{q.name}</span>
                  </td>
                  <td>{fmtPrice(q.last)}</td>
                  <td className={signClass(q.chg)}>{fmtChg(q.chg)}</td>
                  <td className={signClass(q.chgPct)}>{fmtPct(q.chgPct)}</td>
                  <td>{fmtPrice(q.bid)}</td>
                  <td>{fmtPrice(q.ask)}</td>
                  <td>{fmtVolume(q.volume)}</td>
                  <td>
                    {fmtPrice(q.dayLow)}&ndash;{fmtPrice(q.dayHigh)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
