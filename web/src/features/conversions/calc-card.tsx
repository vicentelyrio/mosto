import type { ReactNode } from 'react'

import { Box, Stack, Text } from '@mantine/core'

import classes from './calc-card.module.css'

export function CalcCard({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <Box className={classes.card}>
      <Text fw={700} size="sm" mb="md">
        {title}
      </Text>
      <Stack gap="md">{children}</Stack>
    </Box>
  )
}
