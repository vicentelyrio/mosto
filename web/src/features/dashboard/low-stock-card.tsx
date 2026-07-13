import { Box, Group, Stack, Text } from '@mantine/core'

import type { InventoryItem } from '@domain'

import { itemStatus, STATUS_COLOR } from '@features/inventory'

import classes from './low-stock-card.module.css'

export function LowStockCard({ items }: { items: InventoryItem[] }) {
  if (items.length === 0) return null

  return (
    <Box className={classes.card}>
      <Text className={classes.title} mb="sm">
        Low Stock
      </Text>
      <Stack gap={0}>
        {items.slice(0, 5).map((item) => (
          <Group key={item.id} justify="space-between" className={classes.row}>
            <Text size="sm">{item.name}</Text>
            <Text size="sm" fw={600} c={STATUS_COLOR[itemStatus(item)]}>
              {item.amount} {item.unit}
            </Text>
          </Group>
        ))}
      </Stack>
    </Box>
  )
}
