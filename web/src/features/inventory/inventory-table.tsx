import { Badge, Box, Group, Table, Text } from '@mantine/core'

import type { InventoryCategory, InventoryItem } from '@domain'

import { InventoryActionsMenu } from './inventory-actions-menu'
import {
  expiryBadge,
  itemStatus,
  STATUS_COLOR,
  STATUS_LABEL,
} from './inventory-meta'

function StatusDot({ item }: { item: InventoryItem }) {
  return (
    <Box
      w={8}
      h={8}
      style={{ borderRadius: '50%', flexShrink: 0 }}
      bg={`${STATUS_COLOR[itemStatus(item)]}.5`}
    />
  )
}

function ExpiryCell({ expiry }: { expiry: string | null }) {
  const badge = expiryBadge(expiry)
  return (
    <Group gap={6} wrap="nowrap">
      <Text size="sm" c="dimmed">
        {expiry ?? '—'}
      </Text>
      {badge && (
        <Badge size="xs" color={badge.color} variant="light">
          {badge.label}
        </Badge>
      )}
    </Group>
  )
}

function secondColumn(item: InventoryItem, category: InventoryCategory) {
  if (category === 'hop') return `${item.alpha}% AA · ${item.form}`
  if (category === 'yeast') return item.form
  return item.brand || '—'
}

export function InventoryTable({
  items,
  category,
  onEdit,
}: {
  items: InventoryItem[]
  category: InventoryCategory
  onEdit: (item: InventoryItem) => void
}) {
  const secondHeader =
    category === 'hop' ? 'Alpha' : category === 'yeast' ? 'Type' : 'Brand'

  return (
    <Table.ScrollContainer minWidth={600}>
      <Table verticalSpacing="sm" highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Name</Table.Th>
            <Table.Th>{secondHeader}</Table.Th>
            <Table.Th>Amount</Table.Th>
            <Table.Th>Expiry</Table.Th>
            <Table.Th>Status</Table.Th>
            <Table.Th />
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {items.map((item) => {
            const status = itemStatus(item)
            return (
              <Table.Tr key={item.id}>
                <Table.Td>
                  <Group gap="xs" wrap="nowrap">
                    <StatusDot item={item} />
                    <Text fw={500}>{item.name}</Text>
                  </Group>
                </Table.Td>
                <Table.Td>
                  <Text size="sm" c="dimmed">
                    {secondColumn(item, category)}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Text fw={700} c={status === 'out' ? 'red' : undefined}>
                    {item.amount} {item.unit}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <ExpiryCell expiry={item.expiry} />
                </Table.Td>
                <Table.Td>
                  <Text size="sm" fw={600} c={STATUS_COLOR[status]}>
                    {STATUS_LABEL[status]}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <InventoryActionsMenu item={item} onEdit={onEdit} />
                </Table.Td>
              </Table.Tr>
            )
          })}
        </Table.Tbody>
      </Table>
    </Table.ScrollContainer>
  )
}
