import { createFileRoute } from '@tanstack/react-router'

import { Text } from '@mantine/core'

import { PageTemplate } from '@templates/page-template'

export const Route = createFileRoute('/_app/inventory')({
  component: Placeholder,
})

function Placeholder() {
  return (
    <PageTemplate title="Inventory">
      <Text c="dimmed">
        Not wired up yet — grains/hops/yeast/adjuncts/water chem/packaging
        follow the recipes pattern next.
      </Text>
    </PageTemplate>
  )
}
