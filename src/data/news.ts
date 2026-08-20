import type { NewsItem } from './types'
import { UNIVERSE } from './universe'

const SOURCES = ['BLOOMBERG', 'REUTERS', 'WSJ', 'CNBC', 'MARKETWATCH', 'BBRG TV']

const TEMPLATES: Array<{ text: (s: string, n: string) => string; relevance: NewsItem['relevance'] }> = [
  { text: (s, n) => `${n} (${s}) shares move on heavy volume as options market prices in wider swings`, relevance: 'high' },
  { text: (s, n) => `${n} (${s}) upgraded to Overweight, price target raised on margin outlook`, relevance: 'high' },
  { text: (s, n) => `${n} (${s}) downgraded to Underweight citing valuation concerns`, relevance: 'high' },
  { text: (s, _n) => `${s}: block trade crosses tape, ${(20 + Math.random() * 80).toFixed(0)}k shares`, relevance: 'medium' },
  { text: (_s, n) => `${n} board authorizes new buyback program`, relevance: 'medium' },
  { text: (_s, n) => `${n} CEO to present at upcoming investor conference`, relevance: 'low' },
  { text: (_s, _n) => `Fed officials signal data-dependent path on rates into next meeting`, relevance: 'high' },
  { text: (_s, _n) => `Treasury yields drift as traders weigh inflation prints`, relevance: 'medium' },
  { text: (_s, _n) => `Dollar index steady ahead of PMI data`, relevance: 'low' },
  { text: (_s, _n) => `Crude oil holds gains on inventory draw`, relevance: 'medium' },
  { text: (s, n) => `${n} (${s}) files 8-K disclosing executive changes`, relevance: 'medium' },
  { text: (s, _n) => `Options desk flags unusual call activity in ${s}`, relevance: 'high' },
]

let counter = 0

export function makeHeadline(now: number): NewsItem {
  const entry = UNIVERSE[Math.floor(Math.random() * UNIVERSE.length)]
  const template = TEMPLATES[Math.floor(Math.random() * TEMPLATES.length)]
  counter += 1
  return {
    id: `n${now}-${counter}`,
    time: now,
    headline: template.text(entry.symbol, entry.name),
    source: SOURCES[Math.floor(Math.random() * SOURCES.length)],
    relevance: template.relevance,
    symbols: [entry.symbol],
  }
}

export function seedNews(count: number): NewsItem[] {
  const now = Math.floor(Date.now() / 1000)
  const items: NewsItem[] = []
  for (let i = 0; i < count; i++) {
    items.push(makeHeadline(now - i * 47))
  }
  return items.sort((a, b) => b.time - a.time)
}
