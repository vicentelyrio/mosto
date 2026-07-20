import { useI18nContext } from '@i18n/i18n-react'

import { Box, Group, Progress, Stack, Text } from '@mantine/core'

import { formatDuration } from './format'
import type { BrewStep } from './steps'

export function BatchTimeline({
  steps,
  completedIds,
  current,
  currentElapsedMinutes,
}: {
  steps: BrewStep[]
  completedIds: number[]
  current: BrewStep | null
  currentElapsedMinutes: number
}) {
  const { LL } = useI18nContext()
  const total = steps.reduce((sum, s) => sum + s.duration, 0)
  const doneMinutes = steps
    .filter((s) => completedIds.includes(s.id))
    .reduce((sum, s) => sum + s.duration, 0)
  const elapsed = doneMinutes + currentElapsedMinutes

  const phases = [...new Set(steps.map((s) => s.phase))]
  let before = 0

  return (
    <Stack gap={6} mb="lg">
      <Group justify="space-between">
        <Text
          size="xs"
          fw={600}
          c="dimmed"
          tt="uppercase"
          ff="monospace"
          style={{ letterSpacing: '0.08em' }}
        >
          {LL.brewday.timeline.title()}
        </Text>
        <Text size="xs" ff="monospace" c="dimmed">
          <Text component="span" c="amber" ff="monospace" fw={600} span>
            {formatDuration(Math.round(elapsed))}
          </Text>{' '}
          {LL.brewday.timeline.ofPlanned({ total: formatDuration(total) })}
        </Text>
      </Group>

      <Group gap={3} wrap="nowrap">
        {phases.map((phase) => {
          const phaseDuration = steps
            .filter((s) => s.phase === phase)
            .reduce((sum, s) => sum + s.duration, 0)
          if (!phaseDuration) return null
          const fill = Math.min(
            100,
            Math.max(0, ((elapsed - before) / phaseDuration) * 100),
          )
          before += phaseDuration
          return (
            <Box key={phase} style={{ flex: phaseDuration }}>
              <Progress value={fill} color="amber" size="sm" />
            </Box>
          )
        })}
      </Group>

      <Group gap={3} wrap="nowrap">
        {phases.map((phase) => {
          const phaseDuration = steps
            .filter((s) => s.phase === phase)
            .reduce((sum, s) => sum + s.duration, 0)
          if (!phaseDuration) return null
          return (
            <Text
              key={phase}
              size="xs"
              ff="monospace"
              c={current?.phase === phase ? 'amber' : 'dimmed'}
              tt="uppercase"
              truncate
              style={{ flex: phaseDuration, letterSpacing: '0.05em' }}
            >
              {phase}
            </Text>
          )
        })}
      </Group>
    </Stack>
  )
}
