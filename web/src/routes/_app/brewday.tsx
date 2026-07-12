import { createFileRoute } from '@tanstack/react-router'

import { Stack, Text, Title } from '@mantine/core'

export const Route = createFileRoute('/_app/brewday')({
  component: Placeholder,
})

function Placeholder() {
  return (
    <Stack gap="xs">
      <Title order={2}>Brew Day</Title>
      <Text c="dimmed">
        Not wired up yet — steps, timers, gravity log, and yeast calc follow
        brew-brewday.jsx once BrewSession lands in `core`.
      </Text>
    </Stack>
  )
}
