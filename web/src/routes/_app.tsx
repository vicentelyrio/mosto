import { paths } from '@infrastructure'
import { createFileRoute, redirect } from '@tanstack/react-router'

import { fetchMe, isTauri } from '@domain'

import { AppTemplate } from '@templates/app-template'

export const Route = createFileRoute('/_app')({
  beforeLoad: async () => {
    // The desktop shell has no login/session concept at all — skip the guard
    // entirely there. Self-hosted mode requires an authenticated owner.
    if (isTauri) return
    const me = await fetchMe().catch(() => null)
    if (!me) throw redirect({ to: paths.login })
  },
  component: AppTemplate,
})
