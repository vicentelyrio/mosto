import { useI18nContext } from '@i18n/i18n-react'
import type { TranslationFunctions } from '@i18n/i18n-types'

import { Badge, Box, Group, Table, Text } from '@mantine/core'

import type { InventoryCategory, InventoryItem } from '@domain'

import { InventoryActionsMenu } from './inventory-actions-menu'
import { expiryBadge, itemStatus, STATUS_COLOR } from './inventory-meta'

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

function ExpiryCell({
  LL,
  expiry,
}: {
  LL: TranslationFunctions
  expiry: string | null
}) {
  const badge = expiryBadge(LL, expiry)
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

function secondColumn(
  LL: TranslationFunctions,
  item: InventoryItem,
  category: InventoryCategory,
) {
  if (category === 'hop')
    return LL.inventory.hopMeta({
      alpha: item.alpha ?? 0,
      form: item.form ?? '',
    })
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
  const { LL } = useI18nContext()
  const secondHeader =
    category === 'hop'
      ? LL.inventory.table.alpha()
      : category === 'yeast'
        ? LL.inventory.table.type()
        : LL.inventory.table.brand()

  return (
    <Table.ScrollContainer minWidth={600}>
      <Table verticalSpacing="sm" highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>{LL.inventory.table.name()}</Table.Th>
            <Table.Th>{secondHeader}</Table.Th>
            <Table.Th>{LL.inventory.table.amount()}</Table.Th>
            <Table.Th>{LL.inventory.table.expiry()}</Table.Th>
            <Table.Th>{LL.inventory.table.status()}</Table.Th>
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
                    {secondColumn(LL, item, category)}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Text fw={700} c={status === 'out' ? 'red' : undefined}>
                    {item.amount} {item.unit}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <ExpiryCell LL={LL} expiry={item.expiry} />
                </Table.Td>
                <Table.Td>
                  <Text size="sm" fw={600} c={STATUS_COLOR[status]}>
                    {LL.inventory.status[status]()}
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
