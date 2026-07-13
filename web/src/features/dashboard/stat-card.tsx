import type { ReactNode } from 'react'

import { Box, Text } from '@mantine/core'

import classes from './stat-card.module.css'

export function StatCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string
  value: ReactNode
  sub?: string
  accent?: boolean
}) {
  return (
    <Box className={classes.card}>
      <Text className={classes.label}>{label}</Text>
      <Text className={classes.value} c={accent ? 'amber' : undefined}>
        {value}
      </Text>
      {sub && (
        <Text size="xs" c="dimmed">
          {sub}
        </Text>
      )}
    </Box>
  )
}
