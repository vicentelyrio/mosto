import { type SyntheticEvent, useState } from 'react'

import { paths } from '@infrastructure'
import { createFileRoute, useNavigate } from '@tanstack/react-router'

import {
  Button,
  Center,
  Checkbox,
  Paper,
  PasswordInput,
  Stack,
  Text,
  TextInput,
} from '@mantine/core'

import { ApiError, useAuth } from '@domain'

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
    <Center mih="100vh" bg="dark.8">
      <Paper withBorder p="xl" w={340}>
        <form onSubmit={submit}>
          <Stack gap="md">
            <Text fw={800} size="lg">
              Mosto
            </Text>
            <TextInput
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.currentTarget.value)}
              autoFocus
              required
            />
            <PasswordInput
              label="Password"
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
    </Center>
  )
}
