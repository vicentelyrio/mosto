import { StrictMode } from 'react'

import { createRoot } from 'react-dom/client'

import { paths } from '@infrastructure'
import {
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import { createRouter, RouterProvider } from '@tanstack/react-router'
import {
  localStorageDetector,
  navigatorDetector,
} from 'typesafe-i18n/detectors'

import { MantineProvider } from '@mantine/core'
import { ModalsProvider } from '@mantine/modals'

import { ApiError, isTauri } from '@domain'

import { theme } from '@theme'

import '@mantine/core/styles.css'
import TypesafeI18n from './i18n/i18n-react'
import { detectLocale } from './i18n/i18n-util'
import { loadLocaleAsync } from './i18n/i18n-util.async'
import { routeTree } from './routeTree.gen'

const router = createRouter({ routeTree })
const locale = detectLocale(localStorageDetector, navigatorDetector)

// When any query 401s (e.g. the session expired mid-use), bounce to the login
// page — unless we're already there, or this is the desktop shell (which has
// no login page at all).
const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => {
      if (!isTauri && error instanceof ApiError && error.status === 401) {
        const { pathname } = window.location
        if (pathname !== paths.login) {
          router.navigate({ to: paths.login })
        }
      }
    },
  }),
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

await loadLocaleAsync(locale)

// biome-ignore lint/style/noNonNullAssertion: #root is guaranteed by index.html
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TypesafeI18n locale={locale}>
      <QueryClientProvider client={queryClient}>
        <MantineProvider defaultColorScheme="dark" theme={theme}>
          <ModalsProvider>
            <RouterProvider router={router} />
          </ModalsProvider>
        </MantineProvider>
      </QueryClientProvider>
    </TypesafeI18n>
  </StrictMode>,
)
