import { createFileRoute } from '@tanstack/react-router'

import { Stack, Text, Title } from '@mantine/core'

export const Route = createFileRoute('/_app/conversions')({
  component: Placeholder,
})

function Placeholder() {
  return (
    <Stack gap="xs">
      <Title order={2}>Convert</Title>
      <Text c="dimmed">
        Not wired up yet — SG/Plato/Brix, ABV, and °F/°C converters are pure
        math with no persistence, so these will likely live client-side only.
      </Text>
    </Stack>
  )
}
