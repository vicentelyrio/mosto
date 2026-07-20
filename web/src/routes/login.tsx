import { type SyntheticEvent, useState } from 'react'

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
          setError(err instanceof ApiError ? err.message : 'sign-in failed'),
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
              Sign in to your brewery
            </Text>
          </Stack>
        </Stack>

        <Paper withBorder p="lg">
          <form onSubmit={submit}>
            <Stack gap="md">
              <TextInput
                label="Username"
                placeholder="you@brewery.com"
                classNames={{ label: classes.label }}
                value={username}
                onChange={(e) => setUsername(e.currentTarget.value)}
                autoFocus
                required
              />
              <PasswordInput
                label="Password"
                placeholder="••••••••"
                classNames={{ label: classes.label }}
                value={password}
                onChange={(e) => setPassword(e.currentTarget.value)}
                required
              />
              <Checkbox
                label="Remember me"
                checked={remember}
                onChange={(e) => setRemember(e.currentTarget.checked)}
              />
              {error && (
                <Text c="red" size="sm">
                  {error}
                </Text>
              )}
              <Button type="submit" loading={signIn.isPending} fullWidth>
                Sign in
              </Button>
            </Stack>
          </form>
        </Paper>

        <Text className={classes.footer}>MOSTO · BREWING COMPANION</Text>
      </Box>
    </Box>
  )
}
