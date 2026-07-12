/** A failed API call, carrying the HTTP status (or 0 for a Tauri command
 *  error, which has no status) so callers — and the global query error
 *  handler — can react to auth failures specifically. */
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

interface HttpSpec {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  path: string
}

// Exported so routes can skip server-only concerns (like the login guard)
// when running inside the desktop shell.
export const isTauri =
  typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window

let invokeFn:
  | ((cmd: string, args?: Record<string, unknown>) => Promise<unknown>)
  | null = null

async function invoke(
  cmd: string,
  args?: Record<string, unknown>,
): Promise<unknown> {
  if (!invokeFn) {
    const mod = await import('@tauri-apps/api/core')
    invokeFn = mod.invoke
  }
  try {
    return await invokeFn(cmd, args)
  } catch (e) {
    throw new ApiError(0, typeof e === 'string' ? e : String(e))
  }
}

async function http<T>(
  spec: HttpSpec,
  args?: Record<string, unknown>,
): Promise<T> {
  // By convention, the one key in `args` that carries a JSON body (as opposed
  // to path params like `id`) is always named `body` — see the comment below.
  const payload = args && 'body' in args ? args.body : undefined
  const sendBody =
    payload !== undefined && (spec.method === 'POST' || spec.method === 'PUT')

  const res = await fetch(spec.path, {
    method: spec.method,
    credentials: 'same-origin',
    headers: sendBody ? { 'content-type': 'application/json' } : undefined,
    body: sendBody ? JSON.stringify(payload) : undefined,
  })
  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    throw new ApiError(
      res.status,
      detail || `${spec.method} ${spec.path} -> ${res.status}`,
    )
  }
  return res.status === 204 ? (undefined as T) : res.json()
}

/**
 * The one transport switch in the app. Every `domain/service/*` function
 * calls this with a Tauri command name plus its REST equivalent — nothing
 * above this layer (hooks, features) knows or cares which shell is running.
 *
 * Desktop invokes `op` directly against `core` + local SQLite. Self-hosted
 * calls the REST route over HTTP (same-origin, session cookie attached).
 *
 * Convention: `args` mirrors the Tauri command's named parameters exactly
 * (e.g. `{ id }`, `{ id, body }`). For HTTP, path params like `id` must
 * already be baked into `spec.path`; only `args.body` (if present) is sent
 * as the JSON request body.
 */
export async function request<T>(
  op: string,
  spec: HttpSpec,
  args?: Record<string, unknown>,
): Promise<T> {
  if (isTauri) {
    return (await invoke(op, args)) as T
  }
  return http<T>(spec, args)
}
