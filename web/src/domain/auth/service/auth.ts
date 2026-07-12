import { ApiError } from '@domain/client'

import type { User } from '../entities'

// Auth only exists in self-hosted mode — the desktop shell has no login
// screen and no session concept, so this talks plain `fetch` directly
// instead of going through the client.ts Tauri/HTTP switch.
async function authFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, { credentials: 'same-origin', ...init })
  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    throw new ApiError(
      res.status,
      detail || `${init?.method ?? 'GET'} ${path} -> ${res.status}`,
    )
  }
  return res.status === 204 ? (undefined as T) : res.json()
}

export interface LoginReq {
  username: string
  password: string
  remember: boolean
}

export async function login(req: LoginReq): Promise<User> {
  return authFetch('/api/auth/login', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(req),
  })
}

export async function logout(): Promise<void> {
  return authFetch('/api/auth/logout', { method: 'POST' })
}

export async function fetchMe(): Promise<User> {
  return authFetch('/api/auth/me')
}
