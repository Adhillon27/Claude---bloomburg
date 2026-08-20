interface HelpOverlayProps {
  onClose: () => void
}

const ROWS: Array<{ code: string; desc: string }> = [
  { code: '<TICKER>', desc: 'Load a security, e.g. AAPL or AAPL US Equity' },
  { code: 'DES', desc: 'Security description for the active ticker' },
  { code: 'GP', desc: 'Price graph for the active ticker (default view)' },
  { code: 'TOP', desc: 'Jump to the top headlines panel' },
  { code: 'WEI', desc: 'Jump to world indices / movers panel' },
  { code: 'OB', desc: 'Order book depth ladder for the active ticker' },
  { code: 'OPT', desc: 'Options chain for the active ticker' },
  { code: 'ECO', desc: 'Economic calendar' },
  { code: 'ALRT', desc: 'Set and manage price alerts' },
  { code: 'HELP', desc: 'Show this command reference' },
  { code: '/', desc: 'Focus the command line from anywhere' },
  { code: '↑ / ↓', desc: 'Recall command history (in command line) or move rows (in watchlist)' },
  { code: 'Esc', desc: 'Close overlay / dockable panel' },
]

export function HelpOverlay({ onClose }: HelpOverlayProps) {
  return (
    <div className="help-overlay" onClick={onClose}>
      <div className="help-card" onClick={(e) => e.stopPropagation()}>
        <h2>FUNCTION CODES</h2>
        {ROWS.map((row) => (
          <div className="help-row" key={row.code}>
            <code>{row.code}</code>
            <span>{row.desc}</span>
          </div>
        ))}
        <button className="help-close" onClick={onClose}>
          CLOSE
        </button>
      </div>
    </div>
  )
}
