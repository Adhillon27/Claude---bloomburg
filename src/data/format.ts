export function fmtPrice(n: number): string {
  return n.toFixed(n >= 1000 ? 1 : 2)
}

export function fmtChg(n: number): string {
  const sign = n > 0 ? '+' : n < 0 ? '' : ' '
  return `${sign}${n.toFixed(2)}`
}

export function fmtPct(n: number): string {
  const sign = n > 0 ? '+' : n < 0 ? '' : ' '
  return `${sign}${n.toFixed(2)}%`
}

export function fmtVolume(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return `${Math.round(n)}`
}

export function signClass(n: number): 'pos' | 'neg' | 'flat' {
  if (n > 0) return 'pos'
  if (n < 0) return 'neg'
  return 'flat'
}

export function fmtClockTime(unixSeconds: number): string {
  return new Date(unixSeconds * 1000).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

export function fmtNewsAge(unixSeconds: number, nowMs: number): string {
  const diffSec = Math.max(0, Math.floor(nowMs / 1000 - unixSeconds))
  if (diffSec < 60) return `${diffSec}s`
  const diffMin = Math.floor(diffSec / 60)
  if (diffMin < 60) return `${diffMin}m`
  const diffHr = Math.floor(diffMin / 60)
  return `${diffHr}h`
}
