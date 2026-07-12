import { ActionIcon, Box, Group, Text } from '@mantine/core'

import { XIcon } from '@phosphor-icons/react'

import classes from './inventory-drawer.module.css'

export function InventoryDrawerHeader({
  name,
  subtitle,
  color,
  onClose,
}: {
  name: string
  subtitle: string
  color: string
  onClose: () => void
}) {
  return (
    <Group className={classes.header} justify="space-between" wrap="nowrap">
      <Group wrap="nowrap" gap="sm">
        <Box className={classes.swatch} bg={color} />
        <Box>
          <Text fw={800} size="lg">
            {name}
          </Text>
          <Text size="sm" c="dimmed">
            {subtitle}
          </Text>
        </Box>
      </Group>
      <ActionIcon variant="subtle" color="gray" onClick={onClose}>
        <XIcon size={18} />
      </ActionIcon>
    </Group>
  )
}
