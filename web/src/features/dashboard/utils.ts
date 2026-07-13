import dayjs from 'dayjs'

/** 1-indexed day count since a session's `started_at` (unix seconds), or
 *  null if the session hasn't been started yet. */
export function brewDayNumber(startedAt: number | null): number | null {
  if (startedAt === null) return null
  return Math.max(1, dayjs().diff(dayjs.unix(startedAt), 'day') + 1)
}
