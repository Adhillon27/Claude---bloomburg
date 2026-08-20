import type { Quote } from '../data/types'
import type { PriceAlert } from '../data/useAlerts'
import { OrderBookPanel } from './OrderBookPanel'
import { OptionsChainPanel } from './OptionsChainPanel'
import { EconCalendarPanel } from './EconCalendarPanel'
import { AlertsPanel } from './AlertsPanel'

export type AuxView = 'OB' | 'OPT' | 'ECO' | 'ALRT'

const TABS: Array<{ view: AuxView; label: string }> = [
  { view: 'OB', label: 'ORDER BOOK' },
  { view: 'OPT', label: 'OPTIONS' },
  { view: 'ECO', label: 'ECON CAL' },
  { view: 'ALRT', label: 'ALERTS' },
]

interface AuxPanelProps {
  view: AuxView
  onSelectView: (view: AuxView) => void
  onClose: () => void
  symbol: string | null
  quote: Quote | undefined
  alerts: PriceAlert[]
  onAddAlert: (symbol: string, condition: 'above' | 'below', target: number) => void
  onRemoveAlert: (id: string) => void
  knownSymbols: string[]
}

export function AuxPanel({ view, onSelectView, onClose, symbol, quote, alerts, onAddAlert, onRemoveAlert, knownSymbols }: AuxPanelProps) {
  return (
    <div className="panel panel--aux">
      <div className="panel__header">
        <div className="aux-tabs">
          {TABS.map((t) => (
            <button key={t.view} className={`aux-tab ${t.view === view ? 'aux-tab--active' : ''}`} onClick={() => onSelectView(t.view)}>
              {t.label}
            </button>
          ))}
        </div>
        <button className="aux-close" onClick={onClose} aria-label="Close panel">
          &times;
        </button>
      </div>
      <div className="panel__body">
        {view === 'OB' && <OrderBookPanel quote={quote} />}
        {view === 'OPT' && <OptionsChainPanel symbol={symbol} quote={quote} />}
        {view === 'ECO' && <EconCalendarPanel />}
        {view === 'ALRT' && (
          <AlertsPanel alerts={alerts} onAdd={onAddAlert} onRemove={onRemoveAlert} defaultSymbol={symbol} knownSymbols={knownSymbols} />
        )}
      </div>
    </div>
  )
}
