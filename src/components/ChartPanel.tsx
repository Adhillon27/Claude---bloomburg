import { useMemo, useState } from 'react'
import type { Candle, Quote, SecurityProfile, Timeframe } from '../data/types'
import { fmtChg, fmtPct, fmtPrice, signClass } from '../data/format'
import { useElementSize } from './useElementSize'

const TIMEFRAMES: Timeframe[] = ['1D', '5D', '1M', '6M', '1Y']

interface ChartPanelProps {
  symbol: string | null
  quote: Quote | undefined
  candles: Candle[]
  timeframe: Timeframe
  onTimeframeChange: (tf: Timeframe) => void
  mode: 'GP' | 'DES'
  profile: SecurityProfile | undefined
}

const MARGIN = { top: 10, right: 52, bottom: 18, left: 4 }

export function ChartPanel({ symbol, quote, candles, timeframe, onTimeframeChange, mode, profile }: ChartPanelProps) {
  const { ref, size } = useElementSize<HTMLDivElement>()
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)

  const plot = useMemo(() => {
    if (!candles.length || size.width === 0) return null
    const w = size.width - MARGIN.left - MARGIN.right
    const h = size.height - MARGIN.top - MARGIN.bottom
    const lows = candles.map((c) => c.low)
    const highs = candles.map((c) => c.high)
    const min = Math.min(...lows)
    const max = Math.max(...highs)
    const pad = (max - min) * 0.08 || max * 0.01
    const yMin = min - pad
    const yMax = max + pad
    const slot = w / candles.length
    const candleWidth = Math.max(1, Math.min(10, slot * 0.6))

    const y = (price: number) => MARGIN.top + h - ((price - yMin) / (yMax - yMin)) * h
    const x = (i: number) => MARGIN.left + i * slot + slot / 2

    const linePath = candles.map((c, i) => `${i === 0 ? 'M' : 'L'} ${x(i)} ${y(c.close)}`).join(' ')

    const gridLines = 5
    const gridValues = Array.from({ length: gridLines }, (_, i) => yMin + ((yMax - yMin) * i) / (gridLines - 1))

    return { w, h, x, y, candleWidth, slot, linePath, gridValues, yMin, yMax }
  }, [candles, size])

  function handleMouseMove(e: React.MouseEvent<SVGSVGElement>) {
    if (!plot || !candles.length) return
    const rect = e.currentTarget.getBoundingClientRect()
    const px = e.clientX - rect.left
    const idx = Math.round((px - MARGIN.left - plot.slot / 2) / plot.slot)
    setHoverIndex(Math.max(0, Math.min(candles.length - 1, idx)))
  }

  const displayCandle = hoverIndex !== null ? candles[hoverIndex] : candles[candles.length - 1]
  const useCandlesticks = candles.length <= 130

  return (
    <div className="panel panel--chart">
      <div className="chart-toolbar">
        <span className="chart-toolbar__sym">{symbol ?? '—'}</span>
        {quote && (
          <>
            <span className="chart-toolbar__price">{fmtPrice(quote.last)}</span>
            <span className={`chart-toolbar__chg ${signClass(quote.chg)}`}>
              {fmtChg(quote.chg)} ({fmtPct(quote.chgPct)})
            </span>
          </>
        )}
        <span className="chart-toolbar__spacer" />
        {mode === 'GP' && (
          <div className="tf-group">
            {TIMEFRAMES.map((tf) => (
              <button
                key={tf}
                className={`tf-btn ${tf === timeframe ? 'tf-btn--active' : ''}`}
                onClick={() => onTimeframeChange(tf)}
              >
                {tf}
              </button>
            ))}
          </div>
        )}
        <span className="tf-btn tf-btn--active">{mode}</span>
      </div>
      {mode === 'DES' ? (
        <div className="des-body">
          {profile ? (
            <>
              <dl>
                <dt>NAME</dt>
                <dd>{profile.name}</dd>
                <dt>TICKER</dt>
                <dd>
                  {profile.symbol} {profile.exchange}
                </dd>
                <dt>SECTOR</dt>
                <dd>{profile.sector}</dd>
              </dl>
              <p>{profile.description}</p>
            </>
          ) : (
            <span className="empty-hint">No security selected.</span>
          )}
        </div>
      ) : (
      <div className="chart-canvas-wrap" ref={ref}>
        {displayCandle && (
          <div className="chart-ohlc">
            <span>
              O <b>{fmtPrice(displayCandle.open)}</b>
            </span>
            <span>
              H <b>{fmtPrice(displayCandle.high)}</b>
            </span>
            <span>
              L <b>{fmtPrice(displayCandle.low)}</b>
            </span>
            <span>
              C <b>{fmtPrice(displayCandle.close)}</b>
            </span>
            <span>
              V <b>{Math.round(displayCandle.volume).toLocaleString()}</b>
            </span>
          </div>
        )}
        {plot && (
          <svg
            width={size.width}
            height={size.height}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setHoverIndex(null)}
          >
            {plot.gridValues.map((v, i) => (
              <g key={i}>
                <line
                  x1={MARGIN.left}
                  x2={size.width - MARGIN.right}
                  y1={plot.y(v)}
                  y2={plot.y(v)}
                  stroke="#1c1c1c"
                  strokeWidth={1}
                />
                <text x={size.width - MARGIN.right + 6} y={plot.y(v) + 3} fill="var(--amber-dim)" fontSize={9}>
                  {fmtPrice(v)}
                </text>
              </g>
            ))}

            {useCandlesticks
              ? candles.map((c, i) => {
                  const up = c.close >= c.open
                  const color = up ? 'var(--green)' : 'var(--red)'
                  const bodyTop = plot.y(Math.max(c.open, c.close))
                  const bodyBottom = plot.y(Math.min(c.open, c.close))
                  return (
                    <g key={c.time}>
                      <line x1={plot.x(i)} x2={plot.x(i)} y1={plot.y(c.high)} y2={plot.y(c.low)} stroke={color} strokeWidth={1} />
                      <rect
                        x={plot.x(i) - plot.candleWidth / 2}
                        y={bodyTop}
                        width={plot.candleWidth}
                        height={Math.max(1, bodyBottom - bodyTop)}
                        fill={color}
                      />
                    </g>
                  )
                })
              : <path d={plot.linePath} fill="none" stroke="var(--amber)" strokeWidth={1.5} />}

            {hoverIndex !== null && (
              <line
                x1={plot.x(hoverIndex)}
                x2={plot.x(hoverIndex)}
                y1={MARGIN.top}
                y2={MARGIN.top + plot.h}
                stroke="var(--amber-dim)"
                strokeDasharray="2,2"
              />
            )}
          </svg>
        )}
        {!candles.length && <div className="empty-hint">No chart data. Select a security from the watchlist or command bar.</div>}
      </div>
      )}
    </div>
  )
}
