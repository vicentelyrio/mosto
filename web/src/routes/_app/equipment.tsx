import { createFileRoute } from '@tanstack/react-router'

import { Stack, Text, Title } from '@mantine/core'

export const Route = createFileRoute('/_app/equipment')({
  component: Placeholder,
})

function Placeholder() {
  return (
    <Stack gap="xs">
      <Title order={2}>Equipment</Title>
      <Text c="dimmed">Not wired up yet.</Text>
    </Stack>
  )
}
