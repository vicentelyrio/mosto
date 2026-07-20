import { useI18nContext } from '@i18n/i18n-react'
import type { TranslationFunctions } from '@i18n/i18n-types'

import { Box, Group, Stack, Text } from '@mantine/core'

import type { InventoryCategory, InventoryItem } from '@domain'

import { InventoryActionsMenu } from './inventory-actions-menu'
import classes from './inventory-card-grid.module.css'
import {
  CATEGORY_COLORS,
  expiryBadge,
  itemStatus,
  STATUS_COLOR,
} from './inventory-meta'

function metaLine(
  LL: TranslationFunctions,
  item: InventoryItem,
  category: InventoryCategory,
) {
  if (category === 'hop')
    return LL.inventory.hopMeta({
      alpha: item.alpha ?? 0,
      form: item.form ?? '',
    })
  if (category === 'yeast')
    return [item.form, item.attenuation].filter(Boolean).join(' · ')
  return item.brand
}

export function InventoryCardGrid({
  items,
  category,
  onEdit,
}: {
  items: InventoryItem[]
  category: InventoryCategory
  onEdit: (item: InventoryItem) => void
}) {
  const { LL } = useI18nContext()
  const accent = CATEGORY_COLORS[category]

  return (
    <Box className={classes.grid}>
      {items.map((item) => {
        const status = itemStatus(item)
        const badge = expiryBadge(LL, item.expiry)
        const meta = metaLine(LL, item, category)
        return (
          <Box key={item.id} className={classes.card} data-status={status}>
            <Group
              justify="space-between"
              align="flex-start"
              wrap="nowrap"
              mb="xs"
            >
              <Text fw={600} size="sm" lh={1.3}>
                {item.name}
              </Text>
              <Group gap={4} wrap="nowrap">
                <Box
                  w={8}
                  h={8}
                  mt={4}
                  style={{ borderRadius: '50%', flexShrink: 0 }}
                  bg={`${STATUS_COLOR[status]}.5`}
                />
                <InventoryActionsMenu item={item} onEdit={onEdit} />
              </Group>
            </Group>

            <Text fw={800} size="xl" c={accent} mb={4}>
              {item.amount}{' '}
              <Text component="span" size="sm" fw={500} c="dimmed">
                {item.unit}
              </Text>
            </Text>

            <Stack gap={4}>
              {meta && (
                <Text size="xs" c="dimmed">
                  {meta}
                </Text>
              )}
              {badge && (
                <Text size="xs" c={badge.color}>
                  {badge.label}
                </Text>
              )}
            </Stack>
          </Box>
        )
      })}
    </Box>
  )
}
