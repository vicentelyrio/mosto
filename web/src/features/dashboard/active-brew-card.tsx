import { useI18nContext } from '@i18n/i18n-react'
import { paths } from '@infrastructure'
import { useNavigate } from '@tanstack/react-router'

import {
  Box,
  Button,
  Group,
  Progress,
  SimpleGrid,
  Stack,
  Text,
} from '@mantine/core'

import type { BrewSession, Recipe } from '@domain'
import { useGravityLog } from '@domain'

import classes from './active-brew-card.module.css'
import { brewDayNumber } from './utils'

function clampPct(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)))
}

export function ActiveBrewCard({
  session,
  recipe,
}: {
  session: BrewSession
  recipe: Recipe
}) {
  const { LL } = useI18nContext()
  const navigate = useNavigate()
  const { readings } = useGravityLog(session.id)
  const latest = readings.at(-1)

  const pct =
    latest && recipe.og !== recipe.fg
      ? clampPct(((recipe.og - latest.sg) / (recipe.og - recipe.fg)) * 100)
      : 0

  const day = brewDayNumber(session.started_at)

  return (
    <Box className={classes.card}>
      <Box className={classes.fill} style={{ width: `${pct}%` }} />
      <Stack gap="md" className={classes.content}>
        <Group justify="space-between" align="flex-start" wrap="nowrap">
          <Box>
            <Text className={classes.eyebrow}>
              {LL.dashboard.stats.activeBrew()}
            </Text>
            <Text fw={700} size="xl">
              {recipe.name}
            </Text>
            <Text size="sm" c="dimmed">
              {recipe.style}
              {day !== null
                ? LL.dashboard.activeBrewCard.dayOfStatus({
                    day,
                    status: session.status,
                  })
                : LL.dashboard.activeBrewCard.statusOnly({
                    status: session.status,
                  })}
            </Text>
          </Box>
          <Button
            onClick={() =>
              navigate({ to: paths.recipeBrewing, params: { id: recipe.id } })
            }
          >
            {LL.dashboard.activeBrewCard.open()}
          </Button>
        </Group>

        <Box>
          <Group justify="space-between" mb={4}>
            <Text size="xs" c="dimmed">
              {LL.dashboard.activeBrewCard.fermentationProgress()}
            </Text>
            <Text size="xs" c="amber" fw={600}>
              {pct}%
            </Text>
          </Group>
          <Progress value={pct} color="amber" size="sm" />
        </Box>

        <SimpleGrid cols={4}>
          {(
            [
              [LL.dashboard.activeBrewCard.og(), recipe.og.toFixed(3)],
              [
                LL.dashboard.activeBrewCard.current(),
                latest ? latest.sg.toFixed(3) : '—',
              ],
              [LL.dashboard.activeBrewCard.targetFg(), recipe.fg.toFixed(3)],
              [
                LL.dashboard.activeBrewCard.temp(),
                latest?.temp != null ? `${latest.temp}°F` : '—',
              ],
            ] as const
          ).map(([label, value]) => (
            <Box key={label}>
              <Text size="xs" c="dimmed">
                {label}
              </Text>
              <Text fw={600} size="sm">
                {value}
              </Text>
            </Box>
          ))}
        </SimpleGrid>
      </Stack>
    </Box>
  )
}
