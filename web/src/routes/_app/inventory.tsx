import { createFileRoute } from '@tanstack/react-router'

import { Stack, Text, Title } from '@mantine/core'

export const Route = createFileRoute('/_app/inventory')({
  component: Placeholder,
})

function Placeholder() {
  return (
    <Stack gap="xs">
      <Title order={2}>Inventory</Title>
      <Text c="dimmed">
        Not wired up yet — grains/hops/yeast/adjuncts/water chem/packaging
        follow the recipes pattern next.
      </Text>
    </Stack>
  )
}
