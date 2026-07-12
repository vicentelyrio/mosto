import { paths } from '@infrastructure'
import { createFileRoute, Link } from '@tanstack/react-router'

import { Stack, Text, Title } from '@mantine/core'

export const Route = createFileRoute('/_app/')({ component: Dashboard })

function Dashboard() {
  return (
    <Stack gap="xs">
      <Title order={2}>Today</Title>
      <Text c="dimmed">
        The dashboard (active fermentation, schedule, restock) lands once
        Inventory and Brew Day are wired up.{' '}
        <Link to={paths.recipes}>Your recipe book is ready</Link> in the
        meantime.
      </Text>
    </Stack>
  )
}
