import { useMemo, useState } from 'react'
import type { Quote } from '../data/types'
import { generateOptionsChain } from '../data/options'
import { fmtPrice } from '../data/format'

interface OptionsChainPanelProps {
  symbol: string | null
  quote: Quote | undefined
}

export function OptionsChainPanel({ symbol, quote }: OptionsChainPanelProps) {
  const chain = useMemo(() => {
    if (!symbol || !quote) return null
    return generateOptionsChain(symbol, quote.last)
  }, [symbol, quote])

  const [expiryIndex, setExpiryIndex] = useState(0)

  if (!chain || !quote) {
    return <div className="empty-hint">No security selected.</div>
  }

  const expiry = chain[Math.min(expiryIndex, chain.length - 1)]
  const atmStrike = expiry.rows.reduce((closest, r) => (Math.abs(r.strike - quote.last) < Math.abs(closest - quote.last) ? r.strike : closest), expiry.rows[0].strike)

  return (
    <div className="opt-wrap">
      <div className="tf-group opt-expiry-group">
        {chain.map((e, i) => (
          <button key={e.label} className={`tf-btn ${i === expiryIndex ? 'tf-btn--active' : ''}`} onClick={() => setExpiryIndex(i)}>
            {e.label}
          </button>
        ))}
      </div>
      <table className="opt-table">
        <thead>
          <tr>
            <th colSpan={4} className="pos">
              CALLS
            </th>
            <th className="opt-strike-head">STRIKE</th>
            <th colSpan={4} className="neg">
              PUTS
            </th>
          </tr>
          <tr>
            <th>BID</th>
            <th>ASK</th>
            <th>VOL</th>
            <th>OI</th>
            <th className="opt-strike-head">&nbsp;</th>
            <th>BID</th>
            <th>ASK</th>
            <th>VOL</th>
            <th>OI</th>
          </tr>
        </thead>
        <tbody>
          {expiry.rows.map((row) => (
            <tr key={row.strike} className={row.strike === atmStrike ? 'opt-row--atm' : ''}>
              <td className="pos">{fmtPrice(row.call.bid)}</td>
              <td className="pos">{fmtPrice(row.call.ask)}</td>
              <td>{row.call.volume}</td>
              <td>{row.call.oi}</td>
              <td className="opt-strike">{fmtPrice(row.strike)}</td>
              <td className="neg">{fmtPrice(row.put.bid)}</td>
              <td className="neg">{fmtPrice(row.put.ask)}</td>
              <td>{row.put.volume}</td>
              <td>{row.put.oi}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="opt-footnote">{expiry.daysOut}D to expiry &middot; synthetic IV, not real market data</div>
    </div>
  )
}
