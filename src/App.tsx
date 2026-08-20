import { useEffect, useRef, useState } from 'react'
import { CommandBar, type CommandBarHandle } from './components/CommandBar'
import { Watchlist } from './components/Watchlist'
import { ChartPanel } from './components/ChartPanel'
import { NewsFeed } from './components/NewsFeed'
import { MoversPanel } from './components/MoversPanel'
import { HelpOverlay } from './components/HelpOverlay'
import { useMarketData } from './data/useMarketData'
import { parseCommand } from './data/commandParser'
import type { Timeframe } from './data/types'

type ChartMode = 'GP' | 'DES'
type PulseTarget = 'news' | 'movers' | null

export default function App() {
  const { quotes, indices, news, getCandles, getProfile } = useMarketData()
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(quotes[0]?.symbol ?? null)
  const [timeframe, setTimeframe] = useState<Timeframe>('1D')
  const [chartMode, setChartMode] = useState<ChartMode>('GP')
  const [helpOpen, setHelpOpen] = useState(false)
  const [pulse, setPulse] = useState<PulseTarget>(null)
  const commandBarRef = useRef<CommandBarHandle>(null)

  useEffect(() => {
    if (!selectedSymbol && quotes.length) setSelectedSymbol(quotes[0].symbol)
  }, [quotes, selectedSymbol])

  useEffect(() => {
    function handleGlobalKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement
      const isTyping = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA'

      if (e.key === '/' && !isTyping) {
        e.preventDefault()
        commandBarRef.current?.focus()
      } else if (e.key === 'Escape') {
        setHelpOpen(false)
      }
    }
    window.addEventListener('keydown', handleGlobalKeyDown)
    return () => window.removeEventListener('keydown', handleGlobalKeyDown)
  }, [])

  useEffect(() => {
    if (!pulse) return
    const id = setTimeout(() => setPulse(null), 900)
    return () => clearTimeout(id)
  }, [pulse])

  function handleExecute(raw: string) {
    const knownSymbols = quotes.map((q) => q.symbol)
    const { symbol, code } = parseCommand(raw, knownSymbols)

    if (symbol) setSelectedSymbol(symbol)

    switch (code) {
      case 'HELP':
        setHelpOpen(true)
        break
      case 'DES':
        setChartMode('DES')
        break
      case 'GP':
        setChartMode('GP')
        break
      case 'TOP':
        setPulse('news')
        break
      case 'WEI':
        setPulse('movers')
        break
      default:
        if (symbol) setChartMode('GP')
        break
    }
  }

  const selectedQuote = quotes.find((q) => q.symbol === selectedSymbol)
  const candles = selectedSymbol ? getCandles(selectedSymbol, timeframe) : []
  const profile = selectedSymbol ? getProfile(selectedSymbol) : undefined

  return (
    <div className="terminal-root">
      <CommandBar ref={commandBarRef} onExecute={handleExecute} activeSymbol={selectedSymbol} />
      <div className="terminal-grid">
        <Watchlist quotes={quotes} selectedSymbol={selectedSymbol} onSelect={setSelectedSymbol} />
        <ChartPanel
          symbol={selectedSymbol}
          quote={selectedQuote}
          candles={candles}
          timeframe={timeframe}
          onTimeframeChange={setTimeframe}
          mode={chartMode}
          profile={profile}
        />
        <NewsFeed news={news} onSymbolClick={setSelectedSymbol} pulse={pulse === 'news'} />
        <MoversPanel quotes={quotes} indices={indices} onSelect={setSelectedSymbol} pulse={pulse === 'movers'} />
      </div>
      {helpOpen && <HelpOverlay onClose={() => setHelpOpen(false)} />}
    </div>
  )
}
