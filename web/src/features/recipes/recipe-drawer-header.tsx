import { ActionIcon, Box, Group, Text } from '@mantine/core'

import { XIcon } from '@phosphor-icons/react'

import classes from './recipe-drawer.module.css'
import { srmToHex } from './srm'

export function RecipeDrawerHeader({
  name,
  subtitle,
  srm,
  onClose,
}: {
  name: string
  subtitle: string
  srm: number
  onClose: () => void
}) {
  return (
    <Group className={classes.header} justify="space-between" wrap="nowrap">
      <Group wrap="nowrap" gap="sm">
        <Box className={classes.swatch} bg={srmToHex(srm)} />
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
