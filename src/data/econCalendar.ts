import { hashSeed, mulberry32 } from './rng'

export interface EconEvent {
  id: string
  timestamp: number
  country: string
  event: string
  importance: 'high' | 'medium' | 'low'
  actual: string
  forecast: string
  previous: string
}

interface EventTemplate {
  country: string
  event: string
  importance: EconEvent['importance']
  unit: '%' | 'K' | 'index'
}

const TEMPLATES: EventTemplate[] = [
  { country: 'US', event: 'CPI y/y', importance: 'high', unit: '%' },
  { country: 'US', event: 'Nonfarm Payrolls', importance: 'high', unit: 'K' },
  { country: 'US', event: 'FOMC Rate Decision', importance: 'high', unit: '%' },
  { country: 'US', event: 'Initial Jobless Claims', importance: 'medium', unit: 'K' },
  { country: 'US', event: 'ISM Manufacturing PMI', importance: 'medium', unit: 'index' },
  { country: 'US', event: 'Retail Sales m/m', importance: 'medium', unit: '%' },
  { country: 'US', event: 'Housing Starts', importance: 'low', unit: 'K' },
  { country: 'US', event: 'Consumer Confidence', importance: 'medium', unit: 'index' },
  { country: 'EU', event: 'ECB Rate Decision', importance: 'high', unit: '%' },
  { country: 'EU', event: 'CPI Flash y/y', importance: 'high', unit: '%' },
  { country: 'EU', event: 'PMI Composite', importance: 'medium', unit: 'index' },
  { country: 'UK', event: 'BoE Rate Decision', importance: 'high', unit: '%' },
  { country: 'UK', event: 'GDP q/q', importance: 'medium', unit: '%' },
  { country: 'JP', event: 'BoJ Policy Rate', importance: 'high', unit: '%' },
  { country: 'CN', event: 'Manufacturing PMI', importance: 'medium', unit: 'index' },
]

function fmtValue(v: number, unit: EventTemplate['unit']): string {
  if (unit === '%') return `${v.toFixed(1)}%`
  if (unit === 'K') return `${v.toFixed(0)}K`
  return v.toFixed(1)
}

export function generateEconCalendar(): EconEvent[] {
  const rand = mulberry32(hashSeed('econcal-' + new Date().toDateString()))
  const now = Date.now()
  const events: EconEvent[] = []

  for (let day = -2; day <= 9; day++) {
    const count = day < 0 ? (rand() > 0.6 ? 1 : 0) : rand() > 0.45 ? 2 : 1
    for (let k = 0; k < count; k++) {
      const template = TEMPLATES[Math.floor(rand() * TEMPLATES.length)]
      const hour = 6 + Math.floor(rand() * 12)
      const minute = rand() > 0.5 ? 30 : 0
      const timestamp = now + day * 86400_000 + hour * 3600_000 + minute * 60_000
      const previous = template.unit === '%' ? 2 + rand() * 4 : template.unit === 'K' ? 150 + rand() * 300 : 48 + rand() * 8
      const forecast = previous * (0.92 + rand() * 0.16)
      const isPast = timestamp < now
      const actual = isPast ? forecast * (0.9 + rand() * 0.2) : null

      events.push({
        id: `${day}-${k}-${template.event}`,
        timestamp,
        country: template.country,
        event: template.event,
        importance: template.importance,
        actual: actual !== null ? fmtValue(actual, template.unit) : '--',
        forecast: fmtValue(forecast, template.unit),
        previous: fmtValue(previous, template.unit),
      })
    }
  }

  return events.sort((a, b) => a.timestamp - b.timestamp)
}
