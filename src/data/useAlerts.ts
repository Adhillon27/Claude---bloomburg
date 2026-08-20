import { useCallback, useEffect, useRef, useState } from 'react'
import type { Quote } from './types'

export interface PriceAlert {
  id: string
  symbol: string
  condition: 'above' | 'below'
  target: number
  createdAt: number
  triggeredAt: number | null
}

const STORAGE_KEY = 'bbrg.alerts.v1'

function loadAlerts(): PriceAlert[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function useAlerts(quotes: Quote[]) {
  const [alerts, setAlerts] = useState<PriceAlert[]>(() => loadAlerts())
  const [justTriggered, setJustTriggered] = useState<PriceAlert[]>([])
  const alertsRef = useRef(alerts)
  alertsRef.current = alerts

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(alerts))
  }, [alerts])

  useEffect(() => {
    if (!quotes.length) return
    const current = alertsRef.current
    if (!current.some((a) => !a.triggeredAt)) return

    const now = Date.now() / 1000
    const newlyTriggered: PriceAlert[] = []
    const next = current.map((a) => {
      if (a.triggeredAt) return a
      const q = quotes.find((quote) => quote.symbol === a.symbol)
      if (!q) return a
      const hit = a.condition === 'above' ? q.last >= a.target : q.last <= a.target
      if (!hit) return a
      const triggered = { ...a, triggeredAt: now }
      newlyTriggered.push(triggered)
      return triggered
    })

    if (newlyTriggered.length) {
      setAlerts(next)
      setJustTriggered((prev) => [...newlyTriggered, ...prev].slice(0, 20))
    }
  }, [quotes])

  const addAlert = useCallback((symbol: string, condition: 'above' | 'below', target: number) => {
    setAlerts((prev) => [
      { id: `a${Date.now()}${Math.random().toString(36).slice(2, 6)}`, symbol, condition, target, createdAt: Date.now() / 1000, triggeredAt: null },
      ...prev,
    ])
  }, [])

  const removeAlert = useCallback((id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id))
  }, [])

  const dismissToast = useCallback((id: string) => {
    setJustTriggered((prev) => prev.filter((a) => a.id !== id))
  }, [])

  return { alerts, addAlert, removeAlert, justTriggered, dismissToast }
}
