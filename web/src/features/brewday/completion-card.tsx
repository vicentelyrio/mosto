import { Badge, Button, Group, Paper, Stack, Text } from '@mantine/core'

import type { SessionStatus } from '@domain'

export function CompletionCard({
  recipeName,
  stepCount,
  status,
  onLogGravity,
  onMarkFermenting,
}: {
  recipeName: string
  stepCount: number
  status: SessionStatus
  onLogGravity: () => void
  onMarkFermenting: () => void
}) {
  return (
    <Paper
      withBorder
      p="lg"
      mb="lg"
      style={{ borderColor: 'var(--mantine-color-green-5)' }}
    >
      <Stack gap="xs">
        <Text
          size="xs"
          fw={700}
          c="green"
          tt="uppercase"
          style={{ letterSpacing: '0.08em' }}
        >
          Brew Day Complete
        </Text>
        <Text fw={800} size="xl">
          All {stepCount} steps done
        </Text>
        <Text size="sm" c="dimmed">
          {recipeName} is in the fermentor. Log your OG and track gravity from
          here.
        </Text>
        <Group gap="sm" mt="sm">
          <Button onClick={onLogGravity}>Log gravity →</Button>
          {status === 'brewing' ? (
            <Button variant="default" onClick={onMarkFermenting}>
              Mark Fermenting
            </Button>
          ) : (
            <Badge color="amber" variant="light" size="lg">
              {status}
            </Badge>
          )}
        </Group>
      </Stack>
    </Paper>
  )
}
