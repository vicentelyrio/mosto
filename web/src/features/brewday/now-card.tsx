import { Button, Group, Paper, Progress, Stack, Text } from '@mantine/core'

import { PauseIcon, PlayIcon } from '@phosphor-icons/react'

import { formatClock, formatDuration } from './format'
import classes from './now-card.module.css'
import type { BrewStep } from './steps'

export function NowCard({
  step,
  next,
  started,
  running,
  displaySeconds,
  isOvertime,
  targetSeconds,
  elapsedSeconds,
  onStart,
  onPauseResume,
  onPlus5,
  onConfirm,
}: {
  step: BrewStep
  next: BrewStep | null
  started: boolean
  running: boolean
  displaySeconds: number
  isOvertime: boolean
  targetSeconds: number
  elapsedSeconds: number
  onStart: () => void
  onPauseResume: () => void
  onPlus5: () => void
  onConfirm: () => void
}) {
  const hasDur = step.duration > 0
  const pct =
    hasDur && started
      ? Math.min(100, Math.round((elapsedSeconds / targetSeconds) * 100))
      : 0

  return (
    <Paper
      withBorder
      p="lg"
      mb="lg"
      className={isOvertime ? classes.overtime : undefined}
      style={{
        borderColor: `var(--mantine-color-${isOvertime ? 'red' : 'amber'}-5)`,
      }}
    >
      <Stack gap="md">
        <Group align="flex-start" justify="space-between" wrap="wrap" gap="lg">
          <Stack gap={4} style={{ flex: 1, minWidth: 220 }}>
            <Group gap="xs">
              <Text
                size="xs"
                fw={700}
                c="amber"
                tt="uppercase"
                style={{ letterSpacing: '0.08em' }}
              >
                Now · {step.phase}
              </Text>
              {isOvertime && (
                <Text
                  size="xs"
                  fw={700}
                  c="red"
                  tt="uppercase"
                  className={classes.blink}
                  style={{ letterSpacing: '0.06em' }}
                >
                  Time's up
                </Text>
              )}
            </Group>
            <Text fw={800} size="xl">
              {step.label}
            </Text>
            {step.detail && (
              <Text size="sm" c="dimmed">
                {step.detail}
              </Text>
            )}
          </Stack>

          {hasDur ? (
            <Stack gap={2} align="flex-end">
              <Text
                ff="monospace"
                fw={700}
                size="2.375rem"
                c={isOvertime ? 'red' : 'amber'}
                style={{ lineHeight: 1 }}
              >
                {isOvertime ? '+' : ''}
                {formatClock(started ? displaySeconds : step.duration * 60)}
              </Text>
              <Text size="xs" c="dimmed">
                {isOvertime
                  ? 'over planned time'
                  : `of ${formatDuration(step.duration)}${started && !running ? ' · paused' : ''}`}
              </Text>
            </Stack>
          ) : (
            <Text
              size="sm"
              c="dimmed"
              fs="italic"
              style={{ alignSelf: 'center' }}
            >
              No timer — confirm when done
            </Text>
          )}
        </Group>

        {hasDur && started && (
          <Progress
            value={pct}
            color={isOvertime ? 'red' : 'amber'}
            size="xs"
          />
        )}

        <Group gap="xs" wrap="wrap">
          {hasDur && !started && (
            <Button
              size="xs"
              variant="default"
              c="amber"
              leftSection={<PlayIcon size={12} />}
              onClick={onStart}
            >
              Start {formatDuration(step.duration)} timer
            </Button>
          )}
          {started && running && (
            <Button
              size="xs"
              variant="default"
              leftSection={<PauseIcon size={12} />}
              onClick={onPauseResume}
            >
              Pause
            </Button>
          )}
          {started && !running && (
            <Button
              size="xs"
              variant="default"
              c="amber"
              leftSection={<PlayIcon size={12} />}
              onClick={onPauseResume}
            >
              Resume
            </Button>
          )}
          {started && (
            <Button size="xs" variant="default" onClick={onPlus5}>
              +5m
            </Button>
          )}
          <div style={{ flex: 1 }} />
          <Button size="sm" onClick={onConfirm}>
            {next ? `Done — next: ${next.label} →` : 'Done — finish brew day →'}
          </Button>
        </Group>

        <Text size="xs" c={isOvertime ? 'red' : 'dimmed'} ta="right">
          {isOvertime
            ? 'Waiting for your confirmation — add time if you need it.'
            : next && next.duration > 0
              ? `Next timer (${formatDuration(next.duration)}) starts automatically after you confirm.`
              : next
                ? 'Next step has no timer.'
                : 'Last step of the batch.'}
        </Text>
      </Stack>
    </Paper>
  )
}
