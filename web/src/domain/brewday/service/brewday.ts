import { request } from '@domain/client'

import type {
  BrewSession,
  BrewSessionInput,
  GravityReading,
  GravityReadingInput,
  SessionStatus,
} from '../entities'

export const fetchSessions = (): Promise<BrewSession[]> =>
  request('brewday_list_sessions', {
    method: 'GET',
    path: '/api/brewday/sessions',
  })

export const fetchSession = (id: string): Promise<BrewSession> =>
  request(
    'brewday_get_session',
    { method: 'GET', path: `/api/brewday/sessions/${id}` },
    { id },
  )

export const createSession = (body: BrewSessionInput): Promise<BrewSession> =>
  request(
    'brewday_create_session',
    { method: 'POST', path: '/api/brewday/sessions' },
    { body },
  )

export const updateSessionStatus = (
  id: string,
  status: SessionStatus,
): Promise<BrewSession> =>
  request(
    'brewday_update_session_status',
    { method: 'PUT', path: `/api/brewday/sessions/${id}/status` },
    { id, body: { status } },
  )

export const deleteSession = (id: string): Promise<void> =>
  request(
    'brewday_delete_session',
    { method: 'DELETE', path: `/api/brewday/sessions/${id}` },
    { id },
  )

export const fetchCompletedSteps = (sessionId: string): Promise<number[]> =>
  request(
    'brewday_list_completed_steps',
    { method: 'GET', path: `/api/brewday/sessions/${sessionId}/steps` },
    { id: sessionId },
  )

export const setStepCompleted = (
  sessionId: string,
  stepId: number,
  completed: boolean,
): Promise<void> =>
  request(
    'brewday_set_step_completed',
    {
      method: 'PUT',
      path: `/api/brewday/sessions/${sessionId}/steps/${stepId}`,
    },
    { id: sessionId, step_id: stepId, body: { completed } },
  )

export const fetchGravityReadings = (
  sessionId: string,
): Promise<GravityReading[]> =>
  request(
    'brewday_list_gravity_readings',
    { method: 'GET', path: `/api/brewday/sessions/${sessionId}/gravity` },
    { id: sessionId },
  )

export const addGravityReading = (
  sessionId: string,
  body: GravityReadingInput,
): Promise<GravityReading> =>
  request(
    'brewday_add_gravity_reading',
    { method: 'POST', path: `/api/brewday/sessions/${sessionId}/gravity` },
    { id: sessionId, body },
  )

export const deleteGravityReading = (id: string): Promise<void> =>
  request(
    'brewday_delete_gravity_reading',
    { method: 'DELETE', path: `/api/brewday/gravity/${id}` },
    { id },
  )
