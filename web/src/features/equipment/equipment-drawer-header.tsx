import { ActionIcon, Box, Group, Text } from '@mantine/core'

import { XIcon } from '@phosphor-icons/react'

import classes from './equipment-drawer.module.css'
import { DEFAULT_TYPE_ICON, TYPE_ICONS } from './equipment-meta'

export function EquipmentDrawerHeader({
  name,
  type,
  onClose,
}: {
  name: string
  type: string
  onClose: () => void
}) {
  const TypeIcon = TYPE_ICONS[type] ?? DEFAULT_TYPE_ICON

  return (
    <Group className={classes.header} justify="space-between" wrap="nowrap">
      <Group wrap="nowrap" gap="sm">
        <Box className={classes.swatch} bg="dark.6">
          <TypeIcon
            size={24}
            weight="duotone"
            style={{ margin: '0.5rem', color: 'var(--mantine-color-amber-5)' }}
          />
        </Box>
        <Box>
          <Text fw={800} size="lg">
            {name}
          </Text>
          <Text size="sm" c="dimmed">
            {type}
          </Text>
        </Box>
      </Group>
      <ActionIcon variant="subtle" color="gray" onClick={onClose}>
        <XIcon size={18} />
      </ActionIcon>
    </Group>
  )
}
