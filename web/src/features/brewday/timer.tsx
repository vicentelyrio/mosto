import { ActionIcon, Button, Group, Text } from '@mantine/core'

import {
  ArrowCounterClockwiseIcon,
  PauseIcon,
  PlayIcon,
} from '@phosphor-icons/react'

const PRESET_MINUTES = [5, 10, 15, 60, 90]

function format(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export function Timer({
  seconds,
  running,
  onToggle,
  onReset,
  onPreset,
}: {
  seconds: number
  running: boolean
  onToggle: () => void
  onReset: () => void
  onPreset: (minutes: number) => void
}) {
  return (
    <Group gap="lg" wrap="wrap">
      <Text
        size="xs"
        fw={600}
        c="dimmed"
        tt="uppercase"
        style={{ letterSpacing: '0.05em' }}
      >
        Timer
      </Text>

      <Group gap="xs" wrap="nowrap">
        <Text fw={800} size="xl" c="amber" style={{ minWidth: '4.5rem' }}>
          {format(seconds)}
        </Text>
        <Button
          size="xs"
          color={running ? 'red' : 'green'}
          leftSection={
            running ? <PauseIcon size={12} /> : <PlayIcon size={12} />
          }
          onClick={onToggle}
        >
          {running ? 'Pause' : 'Start'}
        </Button>
        <ActionIcon
          variant="default"
          onClick={onReset}
          aria-label="Reset timer"
        >
          <ArrowCounterClockwiseIcon size={14} />
        </ActionIcon>
      </Group>

      <Group gap={6}>
        {PRESET_MINUTES.map((m) => (
          <Button
            key={m}
            variant="default"
            size="xs"
            onClick={() => onPreset(m)}
          >
            {m}m
          </Button>
        ))}
      </Group>
    </Group>
  )
}
