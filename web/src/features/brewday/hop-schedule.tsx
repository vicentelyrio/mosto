import { Box, Group, Stack, Text } from '@mantine/core'

import type { Recipe } from '@domain'

import classes from './hop-schedule.module.css'

export function HopSchedule({ recipe }: { recipe: Recipe }) {
  const hops = [...recipe.hops].sort((a, b) => b.time - a.time)

  if (hops.length === 0) {
    return (
      <Text c="dimmed" size="sm">
        No hops recorded.
      </Text>
    )
  }

  return (
    <Stack gap="lg">
      <Text fw={700} size="md">
        Hop Addition Timeline
      </Text>
      <Box className={classes.timeline}>
        <Box className={classes.rail} />
        <Stack gap="md">
          {hops.map((h) => (
            <Group
              key={`${h.name}|${h.time}|${h.amount}|${h.use}`}
              wrap="nowrap"
              align="flex-start"
              gap="md"
              pos="relative"
            >
              <Box className={classes.dot} />
              <Box className={classes.time} ta="center">
                <Text fw={700} c="amber" size="sm">
                  @{h.time}m
                </Text>
              </Box>
              <Box className={classes.card}>
                <Text fw={600} size="sm">
                  {h.name}
                </Text>
                <Text size="xs" c="dimmed" mt={2}>
                  {h.amount} {h.unit} · {h.use} · {h.alpha}% AA
                </Text>
              </Box>
            </Group>
          ))}
        </Stack>
      </Box>
    </Stack>
  )
}
