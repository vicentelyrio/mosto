import { type SyntheticEvent, useState } from 'react'

import { useI18nContext } from '@i18n/i18n-react'
import { paths } from '@infrastructure'
import { createFileRoute, useNavigate } from '@tanstack/react-router'

import {
  Box,
  Button,
  Checkbox,
  Paper,
  PasswordInput,
  Stack,
  Text,
  TextInput,
} from '@mantine/core'

import { ApiError, useAuth } from '@domain'

import { BrewLogo } from '@templates/app-template/brew-logo'

import classes from './login.module.css'

export const Route = createFileRoute('/login')({ component: LoginPage })

function LoginPage() {
  const { LL } = useI18nContext()
  const navigate = useNavigate()
  const { signIn } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const submit = (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    signIn.mutate(
      { username, password, remember },
      {
        onSuccess: () => navigate({ to: paths.dashboard }),
        onError: (err) =>
          setError(
            err instanceof ApiError ? err.message : LL.login.signInFailed(),
          ),
      },
    )
  }

  return (
    <Box className={classes.page}>
      <Box className={classes.wrap}>
        <Stack align="center" gap="sm" mb="xl">
          <BrewLogo size={56} />
          <Stack align="center" gap={4}>
            <Text className={classes.title}>Mosto</Text>
            <Text size="sm" c="dark.2">
              {LL.login.tagline()}
            </Text>
          </Stack>
        </Stack>

        <Paper withBorder p="lg">
          <form onSubmit={submit}>
            <Stack gap="md">
              <TextInput
                label={LL.login.usernameLabel()}
                placeholder={LL.login.usernamePlaceholder()}
                classNames={{ label: classes.label }}
                value={username}
                onChange={(e) => setUsername(e.currentTarget.value)}
                autoFocus
                required
              />
              <PasswordInput
                label={LL.login.passwordLabel()}
                placeholder="••••••••"
                classNames={{ label: classes.label }}
                value={password}
                onChange={(e) => setPassword(e.currentTarget.value)}
                required
              />
              <Checkbox
                label={LL.login.rememberMe()}
                checked={remember}
                onChange={(e) => setRemember(e.currentTarget.checked)}
              />
              {error && (
                <Text c="red" size="sm">
                  {error}
                </Text>
              )}
              <Button type="submit" loading={signIn.isPending} fullWidth>
                {LL.login.signIn()}
              </Button>
            </Stack>
          </form>
        </Paper>

        <Text className={classes.footer}>{LL.login.footer()}</Text>
      </Box>
    </Box>
  )
}
