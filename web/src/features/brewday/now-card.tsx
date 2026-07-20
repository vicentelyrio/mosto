import { useI18nContext } from '@i18n/i18n-react'

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
  const { LL } = useI18nContext()
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
                {LL.brewday.nowCard.nowInPhase({ phase: step.phase })}
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
                  {LL.brewday.nowCard.timesUp()}
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
                  ? LL.brewday.nowCard.overPlanned()
                  : `${LL.brewday.nowCard.ofDuration({ duration: formatDuration(step.duration) })}${started && !running ? LL.brewday.nowCard.paused() : ''}`}
              </Text>
            </Stack>
          ) : (
            <Text
              size="sm"
              c="dimmed"
              fs="italic"
              style={{ alignSelf: 'center' }}
            >
              {LL.brewday.nowCard.noTimer()}
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
              {LL.brewday.nowCard.startTimer({
                duration: formatDuration(step.duration),
              })}
            </Button>
          )}
          {started && running && (
            <Button
              size="xs"
              variant="default"
              leftSection={<PauseIcon size={12} />}
              onClick={onPauseResume}
            >
              {LL.brewday.nowCard.pause()}
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
              {LL.brewday.nowCard.resume()}
            </Button>
          )}
          {started && (
            <Button size="xs" variant="default" onClick={onPlus5}>
              {LL.brewday.nowCard.plus5()}
            </Button>
          )}
          <div style={{ flex: 1 }} />
          <Button size="sm" onClick={onConfirm}>
            {next
              ? LL.brewday.nowCard.doneNext({ label: next.label })
              : LL.brewday.nowCard.doneFinish()}
          </Button>
        </Group>

        <Text size="xs" c={isOvertime ? 'red' : 'dimmed'} ta="right">
          {isOvertime
            ? LL.brewday.nowCard.waitingConfirm()
            : next && next.duration > 0
              ? LL.brewday.nowCard.nextTimerStarts({
                  duration: formatDuration(next.duration),
                })
              : next
                ? LL.brewday.nowCard.nextNoTimer()
                : LL.brewday.nowCard.lastStep()}
        </Text>
      </Stack>
    </Paper>
  )
}
