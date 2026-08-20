import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'

export interface CommandBarHandle {
  focus: () => void
}

interface CommandBarProps {
  onExecute: (raw: string) => void
  activeSymbol: string | null
}

function useClock() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])
  return now
}

export const CommandBar = forwardRef<CommandBarHandle, CommandBarProps>(function CommandBar(
  { onExecute, activeSymbol },
  ref,
) {
  const [value, setValue] = useState('')
  const [history, setHistory] = useState<string[]>([])
  const historyIndex = useRef<number>(-1)
  const inputRef = useRef<HTMLInputElement>(null)

  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current?.focus(),
  }))

  function submit() {
    const trimmed = value.trim()
    if (!trimmed) return
    onExecute(trimmed)
    setHistory((h) => [trimmed, ...h].slice(0, 50))
    historyIndex.current = -1
    setValue('')
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      submit()
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (history.length === 0) return
      const next = Math.min(historyIndex.current + 1, history.length - 1)
      historyIndex.current = next
      setValue(history[next])
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      const next = historyIndex.current - 1
      historyIndex.current = next
      setValue(next >= 0 ? history[next] : '')
    }
  }

  const clock = useClock()
  const timeStr = clock.toLocaleTimeString('en-US', { hour12: false }) + ' UTC' + (-clock.getTimezoneOffset() / 60 >= 0 ? '+' : '') + (-clock.getTimezoneOffset() / 60)

  return (
    <div className="command-bar">
      <div className="command-bar__logo">BBRG</div>
      <div className="command-bar__form">
        <span className="command-bar__prompt">&gt;</span>
        <input
          ref={inputRef}
          className="command-bar__input"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={activeSymbol ? `${activeSymbol} DES <GO>  |  try HELP` : 'AAPL US Equity <GO>  |  try HELP'}
          spellCheck={false}
          autoComplete="off"
        />
        <button className="command-bar__go" onClick={submit}>
          &lt;GO&gt;
        </button>
      </div>
      <span className="command-bar__hint">/ to focus &middot; &uarr; history</span>
      <span className="command-bar__clock">{timeStr}</span>
    </div>
  )
})
