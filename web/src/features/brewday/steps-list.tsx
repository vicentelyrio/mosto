import { useState } from 'react'

import { useI18nContext } from '@i18n/i18n-react'

import { Badge, Box, Group, Stack, Text, UnstyledButton } from '@mantine/core'

import { CheckIcon } from '@phosphor-icons/react'

import { formatClock, formatDuration } from './format'
import type { BrewStep } from './steps'
import classes from './steps-list.module.css'

export function StepsList({
  steps,
  completedIds,
  currentStepId,
  liveStarted,
  liveDisplaySeconds,
  liveIsOvertime,
  onToggle,
}: {
  steps: BrewStep[]
  completedIds: number[]
  currentStepId: number | null
  liveStarted: boolean
  liveDisplaySeconds: number
  liveIsOvertime: boolean
  onToggle: (stepId: number) => void
}) {
  const { LL } = useI18nContext()
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
                const isNow = currentStepId === step.id
                return (
                  <UnstyledButton
                    key={step.id}
                    className={classes.step}
                    data-active={active || undefined}
                    data-done={done || undefined}
                    data-timing={isNow || undefined}
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
                        <Group gap={6}>
                          <Text
                            size="sm"
                            fw={600}
                            c={done ? 'dimmed' : undefined}
                            td={done ? 'line-through' : undefined}
                          >
                            {step.label}
                          </Text>
                          {isNow && (
                            <Badge size="xs" color="amber">
                              {LL.brewday.stepsList.now()}
                            </Badge>
                          )}
                        </Group>
                        {step.detail && (
                          <Text size="xs" c="dimmed" mt={2}>
                            {step.detail}
                          </Text>
                        )}
                      </Box>
                      {step.duration > 0 && (
                        <Text
                          size="xs"
                          fw={600}
                          ff="monospace"
                          c={
                            isNow && liveStarted
                              ? liveIsOvertime
                                ? 'red'
                                : 'amber'
                              : 'dimmed'
                          }
                          className={classes.durationBadge}
                        >
                          {isNow && liveStarted
                            ? `${liveIsOvertime ? '+' : ''}${formatClock(liveDisplaySeconds)}`
                            : formatDuration(step.duration)}
                        </Text>
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
