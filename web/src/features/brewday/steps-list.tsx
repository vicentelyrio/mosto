import { useState } from 'react'

import { Box, Button, Group, Stack, Text, UnstyledButton } from '@mantine/core'

import { CheckIcon, PlayIcon } from '@phosphor-icons/react'

import type { BrewStep } from './steps'
import classes from './steps-list.module.css'

export function StepsList({
  steps,
  completedIds,
  onToggle,
  onStartTimer,
}: {
  steps: BrewStep[]
  completedIds: number[]
  onToggle: (stepId: number) => void
  onStartTimer: (minutes: number) => void
}) {
  const [activeStep, setActiveStep] = useState<number | null>(null)
  const phases = [...new Set(steps.map((s) => s.phase))]

  return (
    <Stack gap="xl">
      {phases.map((phase) => (
        <Stack key={phase} gap="xs">
          <Group gap="sm">
            <Text component="span" className={classes.phaseLabel}>
              {phase}
            </Text>
            <Box className={classes.phaseLine} />
          </Group>

          <Stack gap={6}>
            {steps
              .filter((s) => s.phase === phase)
              .map((step) => {
                const done = completedIds.includes(step.id)
                const active = activeStep === step.id
                return (
                  <UnstyledButton
                    key={step.id}
                    className={classes.step}
                    data-active={active || undefined}
                    data-done={done || undefined}
                    onClick={() => setActiveStep(active ? null : step.id)}
                  >
                    <Group gap="sm" wrap="nowrap" align="flex-start">
                      <UnstyledButton
                        className={classes.checkbox}
                        data-done={done || undefined}
                        onClick={(e) => {
                          e.stopPropagation()
                          onToggle(step.id)
                        }}
                      >
                        {done && <CheckIcon size={12} weight="bold" />}
                      </UnstyledButton>
                      <Box flex={1}>
                        <Text
                          size="sm"
                          fw={600}
                          c={done ? 'dimmed' : undefined}
                          td={done ? 'line-through' : undefined}
                        >
                          {step.label}
                        </Text>
                        {step.detail && (
                          <Text size="xs" c="dimmed" mt={2}>
                            {step.detail}
                          </Text>
                        )}
                      </Box>
                      {step.duration > 0 && (
                        <Button
                          size="compact-xs"
                          variant="default"
                          leftSection={<PlayIcon size={10} />}
                          onClick={(e) => {
                            e.stopPropagation()
                            onStartTimer(step.duration)
                          }}
                        >
                          {step.duration}m
                        </Button>
                      )}
                    </Group>
                  </UnstyledButton>
                )
              })}
          </Stack>
        </Stack>
      ))}
    </Stack>
  )
}
