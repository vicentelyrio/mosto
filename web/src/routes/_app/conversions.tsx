import { createFileRoute } from '@tanstack/react-router'

import { Text } from '@mantine/core'

import { PageTemplate } from '@templates/page-template'

export const Route = createFileRoute('/_app/conversions')({
  component: Placeholder,
})

function Placeholder() {
  return (
    <PageTemplate title="Convert">
      <Text c="dimmed">
        Not wired up yet — SG/Plato/Brix, ABV, and °F/°C converters are pure
        math with no persistence, so these will likely live client-side only.
      </Text>
    </PageTemplate>
  )
}
