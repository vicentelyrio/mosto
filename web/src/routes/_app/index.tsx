import { paths } from '@infrastructure'
import { createFileRoute, Link } from '@tanstack/react-router'

import { Text } from '@mantine/core'

import { PageTemplate } from '@templates/page-template'

export const Route = createFileRoute('/_app/')({ component: Dashboard })

function Dashboard() {
  return (
    <PageTemplate title="Today">
      <Text c="dimmed">
        The dashboard (active fermentation, schedule, restock) lands once it's
        wired up. <Link to={paths.recipes}>Your recipe book is ready</Link> in
        the meantime.
      </Text>
    </PageTemplate>
  )
}
