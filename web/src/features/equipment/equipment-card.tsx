import { Badge, Box, Group, Stack, Text } from '@mantine/core'

import type { Equipment } from '@domain'

import { EquipmentActionsMenu } from './equipment-actions-menu'
import classes from './equipment-card.module.css'
import {
  CONDITION_COLOR,
  CONDITION_LABEL,
  DEFAULT_TYPE_ICON,
  TYPE_ICONS,
} from './equipment-meta'

export function EquipmentCard({
  item,
  onEdit,
}: {
  item: Equipment
  onEdit: (item: Equipment) => void
}) {
  const TypeIcon = TYPE_ICONS[item.type] ?? DEFAULT_TYPE_ICON

  return (
    <Box className={classes.card}>
      <Stack gap="sm">
        <Group justify="space-between" align="flex-start" wrap="nowrap">
          <Group gap="sm" wrap="nowrap" align="flex-start">
            <TypeIcon size={28} weight="duotone" className={classes.icon} />
            <Box>
              <Text fw={700} size="sm">
                {item.name}
              </Text>
              <Text size="xs" c="dimmed">
                {item.type}
              </Text>
            </Box>
          </Group>
          <Group gap="xs" wrap="nowrap">
            <Badge color={CONDITION_COLOR[item.condition]} variant="light">
              {CONDITION_LABEL[item.condition]}
            </Badge>
            <EquipmentActionsMenu item={item} onEdit={onEdit} />
          </Group>
        </Group>

        {(item.capacity || item.material) && (
          <Group gap="xs">
            {item.capacity && item.capacity !== '—' && (
              <Text component="span" className={classes.chip}>
                {item.capacity}
              </Text>
            )}
            {item.material && item.material !== '—' && (
              <Text component="span" className={classes.chip}>
                {item.material}
              </Text>
            )}
          </Group>
        )}

        {item.notes && (
          <Text size="xs" c="dimmed" lh={1.5} className={classes.notes}>
            {item.notes}
          </Text>
        )}
      </Stack>
    </Box>
  )
}
