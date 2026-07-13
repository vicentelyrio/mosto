export type SessionStatus =
  | 'planning'
  | 'brewing'
  | 'fermenting'
  | 'conditioning'
  | 'packaged'
  | 'archived'

export interface BrewSession {
  id: string
  recipe_id: string
  status: SessionStatus
  started_at: number | null
}

/** Create payload — same shape as `BrewSession` minus the server-assigned `id`. */
export type BrewSessionInput = Omit<BrewSession, 'id'>

export interface GravityReading {
  id: string
  session_id: string
  date: string
  sg: number
  temp: number | null
  note: string
}

/** Create payload — same shape as `GravityReading` minus the server-assigned
 *  `id` and `session_id` (which comes from the URL path). */
export type GravityReadingInput = Omit<GravityReading, 'id' | 'session_id'>
