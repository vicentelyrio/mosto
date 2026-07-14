/** MM:SS clock display, e.g. for a countdown/overtime timer. */
export function formatClock(seconds: number): string {
  const s = Math.abs(Math.round(seconds))
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}

/** Human-readable duration, e.g. "1h 30m" or "45m". */
export function formatDuration(minutes: number): string {
  if (minutes >= 60) {
    const h = Math.floor(minutes / 60)
    const m = minutes % 60
    return m ? `${h}h ${m}m` : `${h}h`
  }
  return `${minutes}m`
}
