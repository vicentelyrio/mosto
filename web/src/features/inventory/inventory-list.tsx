import { useState } from 'react'

import { useI18nContext } from '@i18n/i18n-react'
import { paths } from '@infrastructure'
import { useNavigate } from '@tanstack/react-router'

import {
  Alert,
  Box,
  Button,
  Group,
  SegmentedControl,
  Skeleton,
  Stack,
  Tabs,
  Text,
  TextInput,
} from '@mantine/core'

import {
  GridFourIcon,
  ListIcon,
  PlusIcon,
  WarningIcon,
} from '@phosphor-icons/react'

import {
  type InventoryCategory,
  type InventoryItem,
  useInventory,
} from '@domain'

import { PageTemplate } from '@templates/page-template'

import { InventoryCardGrid } from './inventory-card-grid'
import classes from './inventory-list.module.css'
import { CATEGORY_COLORS, CATEGORY_KEYS, isLowOrOut } from './inventory-meta'
import { InventoryTable } from './inventory-table'

type View = 'table' | 'card'

export function InventoryList() {
  const { LL } = useI18nContext()
  const navigate = useNavigate()
  const { items, query } = useInventory()
  const [category, setCategory] = useState<InventoryCategory>('grain')
  const [view, setView] = useState<View>('table')
  const [search, setSearch] = useState('')

  const lowCount = items.filter(isLowOrOut).length

  const categoryItems = items.filter((i) => i.category === category)
  const filtered = categoryItems.filter((i) =>
    i.name.toLowerCase().includes(search.toLowerCase()),
  )

  const editItem = (item: InventoryItem) =>
    navigate({ to: paths.inventoryItemDetail, params: { id: item.id } })

  return (
    <PageTemplate
      title={LL.inventory.list.title()}
      subtitle={
        query.isSuccess && lowCount === 0
          ? LL.inventory.list.itemsOnHand({ count: items.length })
          : undefined
      }
      actions={
        <Button
          leftSection={<PlusIcon size={16} weight="bold" />}
          onClick={() =>
            navigate({ to: paths.newInventoryItem, search: { category } })
          }
        >
          {LL.inventory.list.addButton()}
        </Button>
      }
    >
      {lowCount > 0 && (
        <Group gap={6} mb="lg">
          <WarningIcon
            size={14}
            weight="fill"
            color="var(--mantine-color-red-5)"
          />
          <Text size="sm" c="red" fw={600}>
            {LL.inventory.list.lowStockWarning({ count: lowCount })}
          </Text>
        </Group>
      )}

      <Group justify="space-between" mb="md" wrap="wrap">
        <Tabs
          value={category}
          onChange={(value) => {
            setCategory((value as InventoryCategory) ?? 'grain')
            setSearch('')
          }}
        >
          <Tabs.List>
            {CATEGORY_KEYS.map((key) => {
              const count = items.filter((i) => i.category === key).length
              const hasBad = items.some(
                (i) => i.category === key && isLowOrOut(i),
              )
              return (
                <Tabs.Tab
                  key={key}
                  value={key}
                  color={CATEGORY_COLORS[key]}
                  rightSection={
                    <Group gap={4} wrap="nowrap">
                      <Text
                        component="span"
                        size="xs"
                        className={classes.count}
                      >
                        {count}
                      </Text>
                      {hasBad && (
                        <Box
                          w={6}
                          h={6}
                          bg="red.5"
                          style={{ borderRadius: '50%' }}
                        />
                      )}
                    </Group>
                  }
                >
                  {LL.inventory.category[key]()}
                </Tabs.Tab>
              )
            })}
          </Tabs.List>
        </Tabs>

        <SegmentedControl
          value={view}
          onChange={(v) => setView(v as View)}
          data={[
            { value: 'table', label: <ListIcon size={16} weight="bold" /> },
            { value: 'card', label: <GridFourIcon size={16} weight="bold" /> },
          ]}
        />
      </Group>

      <TextInput
        className={classes.search}
        placeholder={LL.inventory.list.searchPlaceholder({
          category: LL.inventory.category[category]().toLowerCase(),
        })}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
        mb="md"
      />

      {query.isError ? (
        <Alert color="red" title={LL.inventory.list.loadError.title()}>
          {LL.inventory.list.loadError.message()}
        </Alert>
      ) : query.isLoading ? (
        <Stack gap="xs">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} height={40} radius="sm" />
          ))}
        </Stack>
      ) : filtered.length === 0 ? (
        <Text c="dimmed" ta="center" py="xl">
          {categoryItems.length === 0
            ? LL.inventory.list.empty()
            : LL.inventory.list.emptySearch()}
        </Text>
      ) : view === 'table' ? (
        <InventoryTable
          items={filtered}
          category={category}
          onEdit={editItem}
        />
      ) : (
        <InventoryCardGrid
          items={filtered}
          category={category}
          onEdit={editItem}
        />
      )}
    </PageTemplate>
  )
}
