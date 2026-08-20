import { useState } from 'react'
import type { PriceAlert } from '../data/useAlerts'
import { fmtPrice } from '../data/format'

interface AlertsPanelProps {
  alerts: PriceAlert[]
  onAdd: (symbol: string, condition: 'above' | 'below', target: number) => void
  onRemove: (id: string) => void
  defaultSymbol: string | null
  knownSymbols: string[]
}

export function AlertsPanel({ alerts, onAdd, onRemove, defaultSymbol, knownSymbols }: AlertsPanelProps) {
  const [symbol, setSymbol] = useState(defaultSymbol ?? '')
  const [condition, setCondition] = useState<'above' | 'below'>('above')
  const [target, setTarget] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const sym = symbol.trim().toUpperCase()
    const price = parseFloat(target)
    if (!sym || !Number.isFinite(price) || price <= 0) return
    onAdd(sym, condition, price)
    setTarget('')
  }

  const pending = alerts.filter((a) => !a.triggeredAt)
  const triggered = alerts.filter((a) => a.triggeredAt).sort((a, b) => (b.triggeredAt ?? 0) - (a.triggeredAt ?? 0))
  const symbolValid = knownSymbols.includes(symbol.trim().toUpperCase())

  return (
    <div className="alerts-wrap">
      <form className="alerts-form" onSubmit={handleSubmit}>
        <input
          className="alerts-form__input"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value.toUpperCase())}
          placeholder="TICKER"
          list="known-symbols"
          spellCheck={false}
        />
        <datalist id="known-symbols">
          {knownSymbols.map((s) => (
            <option key={s} value={s} />
          ))}
        </datalist>
        <select className="alerts-form__select" value={condition} onChange={(e) => setCondition(e.target.value as 'above' | 'below')}>
          <option value="above">ABOVE</option>
          <option value="below">BELOW</option>
        </select>
        <input
          className="alerts-form__input alerts-form__input--price"
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          placeholder="PRICE"
          inputMode="decimal"
        />
        <button className="alerts-form__submit" type="submit" disabled={!symbol || !target}>
          SET
        </button>
      </form>
      {symbol && !symbolValid && <div className="alerts-hint">Unknown ticker &mdash; alert will not fire</div>}

      <div className="alerts-section-title">ACTIVE ({pending.length})</div>
      <div className="alerts-list">
        {pending.length === 0 && <div className="empty-hint">No active alerts.</div>}
        {pending.map((a) => (
          <div className="alert-row" key={a.id}>
            <span className="wl-sym">{a.symbol}</span>
            <span className="alert-row__cond">
              {a.condition === 'above' ? '↑' : '↓'} {fmtPrice(a.target)}
            </span>
            <button className="alert-row__remove" onClick={() => onRemove(a.id)} aria-label="Remove alert">
              &times;
            </button>
          </div>
        ))}
      </div>

      {triggered.length > 0 && (
        <>
          <div className="alerts-section-title">TRIGGERED ({triggered.length})</div>
          <div className="alerts-list">
            {triggered.map((a) => (
              <div className="alert-row alert-row--triggered" key={a.id}>
                <span className="wl-sym">{a.symbol}</span>
                <span className="alert-row__cond">
                  {a.condition === 'above' ? '↑' : '↓'} {fmtPrice(a.target)}
                </span>
                <button className="alert-row__remove" onClick={() => onRemove(a.id)} aria-label="Remove alert">
                  &times;
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
