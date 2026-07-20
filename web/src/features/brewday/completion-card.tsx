import { useI18nContext } from '@i18n/i18n-react'

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
  const { LL } = useI18nContext()
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
          {LL.brewday.completion.title()}
        </Text>
        <Text fw={800} size="xl">
          {LL.brewday.completion.allStepsDone({ count: stepCount })}
        </Text>
        <Text size="sm" c="dimmed">
          {LL.brewday.completion.inFermentor({ name: recipeName })}
        </Text>
        <Group gap="sm" mt="sm">
          <Button onClick={onLogGravity}>
            {LL.brewday.completion.logGravity()}
          </Button>
          {status === 'brewing' ? (
            <Button variant="default" onClick={onMarkFermenting}>
              {LL.brewday.completion.markFermenting()}
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
