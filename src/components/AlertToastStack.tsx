import type { PriceAlert } from '../data/useAlerts'
import { fmtPrice } from '../data/format'

interface AlertToastStackProps {
  toasts: PriceAlert[]
  onDismiss: (id: string) => void
}

export function AlertToastStack({ toasts, onDismiss }: AlertToastStackProps) {
  if (!toasts.length) return null
  return (
    <div className="alert-toast-stack">
      {toasts.map((t) => (
        <div className="alert-toast" key={t.id} onClick={() => onDismiss(t.id)}>
          <span className="alert-toast__tag">ALERT</span>
          <span>
            {t.symbol} crossed {t.condition} {fmtPrice(t.target)}
          </span>
        </div>
      ))}
    </div>
  )
}
