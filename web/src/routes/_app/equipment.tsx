import { createFileRoute } from '@tanstack/react-router'

import { Text } from '@mantine/core'

import { PageTemplate } from '@templates/page-template'

export const Route = createFileRoute('/_app/equipment')({
  component: Placeholder,
})

function Placeholder() {
  return (
    <PageTemplate title="Equipment">
      <Text c="dimmed">Not wired up yet.</Text>
    </PageTemplate>
  )
}
