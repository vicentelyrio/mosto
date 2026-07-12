import { createFileRoute } from '@tanstack/react-router'

import { Text } from '@mantine/core'

import { PageTemplate } from '@templates/page-template'

export const Route = createFileRoute('/_app/brewday')({
  component: Placeholder,
})

function Placeholder() {
  return (
    <PageTemplate title="Brew Day">
      <Text c="dimmed">
        Not wired up yet — steps, timers, gravity log, and yeast calc follow
        brew-brewday.jsx once BrewSession lands in `core`.
      </Text>
    </PageTemplate>
  )
}
