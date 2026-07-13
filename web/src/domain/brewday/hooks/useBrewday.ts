import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import type {
  BrewSession,
  BrewSessionInput,
  GravityReadingInput,
  SessionStatus,
} from '../entities'
import {
  addGravityReading,
  createSession,
  deleteGravityReading,
  deleteSession,
  fetchCompletedSteps,
  fetchGravityReadings,
  fetchSessions,
  setStepCompleted,
  updateSessionStatus,
} from '../service'

export function useBrewSessions() {
  const qc = useQueryClient()
  const refresh = () =>
    qc.invalidateQueries({ queryKey: ['brewday', 'sessions'] })

  const query = useQuery({
    queryKey: ['brewday', 'sessions'],
    queryFn: fetchSessions,
  })

  const create = useMutation({
    mutationFn: (input: BrewSessionInput) => createSession(input),
    onSuccess: refresh,
  })

  const remove = useMutation({
    mutationFn: (id: string) => deleteSession(id),
    onSuccess: refresh,
  })

  return { sessions: query.data ?? [], query, create, remove }
}

export function useSessionStatus(session: BrewSession | undefined) {
  const qc = useQueryClient()

  const update = useMutation({
    mutationFn: (status: SessionStatus) => {
      if (!session) throw new Error('no session')
      return updateSessionStatus(session.id, status)
    },
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ['brewday', 'sessions'] }),
  })

  return { update }
}

export function useStepCompletions(sessionId: string | undefined) {
  const qc = useQueryClient()
  const key = ['brewday', 'sessions', sessionId, 'steps']

  const query = useQuery({
    queryKey: key,
    queryFn: () => fetchCompletedSteps(sessionId as string),
    enabled: sessionId !== undefined,
  })

  const toggle = useMutation({
    mutationFn: ({
      stepId,
      completed,
    }: {
      stepId: number
      completed: boolean
    }) => {
      if (!sessionId) throw new Error('no session')
      return setStepCompleted(sessionId, stepId, completed)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  })

  return { completedSteps: query.data ?? [], query, toggle }
}

export function useGravityLog(sessionId: string | undefined) {
  const qc = useQueryClient()
  const key = ['brewday', 'sessions', sessionId, 'gravity']

  const query = useQuery({
    queryKey: key,
    queryFn: () => fetchGravityReadings(sessionId as string),
    enabled: sessionId !== undefined,
  })

  const add = useMutation({
    mutationFn: (input: GravityReadingInput) => {
      if (!sessionId) throw new Error('no session')
      return addGravityReading(sessionId, input)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  })

  const remove = useMutation({
    mutationFn: (id: string) => deleteGravityReading(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  })

  return { readings: query.data ?? [], query, add, remove }
}
