import { useMemo } from 'react'
import type { IndexQuote, Quote } from '../data/types'
import { fmtChg, fmtPct, fmtPrice, signClass } from '../data/format'

interface MoversPanelProps {
  quotes: Quote[]
  indices: IndexQuote[]
  onSelect: (symbol: string) => void
  pulse?: boolean
}

export function MoversPanel({ quotes, indices, onSelect, pulse }: MoversPanelProps) {
  const { gainers, losers } = useMemo(() => {
    const sorted = [...quotes].sort((a, b) => b.chgPct - a.chgPct)
    return {
      gainers: sorted.slice(0, 6),
      losers: sorted.slice(-6).reverse(),
    }
  }, [quotes])

  return (
    <div className={`panel panel--movers ${pulse ? 'panel--pulse' : ''}`}>
      <div className="panel__header">
        <span>MOVERS &amp; INDICES</span>
        <span className="panel__header-tag">WEI</span>
      </div>
      <div className="movers-wrap">
        <div className="index-strip">
          {indices.map((idx) => (
            <IndexChip key={idx.symbol} idx={idx} />
          ))}
        </div>
        <div className="movers-cols">
          <div className="movers-col">
            <div className="movers-col__title">TOP GAINERS</div>
            <div className="movers-col__body">
              {gainers.map((q) => (
                <div key={q.symbol} className="mover-row" onClick={() => onSelect(q.symbol)}>
                  <span className="wl-sym">{q.symbol}</span>
                  <span className={signClass(q.chgPct)}>{fmtPct(q.chgPct)}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="movers-col">
            <div className="movers-col__title">TOP LOSERS</div>
            <div className="movers-col__body">
              {losers.map((q) => (
                <div key={q.symbol} className="mover-row" onClick={() => onSelect(q.symbol)}>
                  <span className="wl-sym">{q.symbol}</span>
                  <span className={signClass(q.chgPct)}>{fmtPct(q.chgPct)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function IndexChip({ idx }: { idx: IndexQuote }) {
  const isYield = idx.symbol === 'US10Y'
  return (
    <div className="index-chip">
      <span className="index-chip__label">{idx.label}</span>
      <span className={`index-chip__value ${signClass(idx.chg)}`}>
        {isYield ? idx.last.toFixed(3) : fmtPrice(idx.last)} {fmtChg(idx.chg)}
      </span>
    </div>
  )
}
