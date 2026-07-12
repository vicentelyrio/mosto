import { useState } from 'react'

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
import { InventoryItemFormDrawer } from './inventory-item-form'
import classes from './inventory-list.module.css'
import { CATEGORIES, isLowOrOut } from './inventory-meta'
import { InventoryTable } from './inventory-table'

type View = 'table' | 'card'

export function InventoryList() {
  const { items, query } = useInventory()
  const [category, setCategory] = useState<InventoryCategory>('grain')
  const [view, setView] = useState<View>('table')
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState<
    { mode: 'create' } | { mode: 'edit'; item: InventoryItem } | null
  >(null)

  const lowCount = items.filter(isLowOrOut).length

  const categoryItems = items.filter((i) => i.category === category)
  const filtered = categoryItems.filter((i) =>
    i.name.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <PageTemplate
      title="Inventory"
      subtitle={
        query.isSuccess && lowCount === 0
          ? `${items.length} items on hand`
          : undefined
      }
      actions={
        <Button
          leftSection={<PlusIcon size={16} weight="bold" />}
          onClick={() => setModal({ mode: 'create' })}
        >
          Add Item
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
            {lowCount} items low or out of stock
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
            {CATEGORIES.map((c) => {
              const count = items.filter((i) => i.category === c.key).length
              const hasBad = items.some(
                (i) => i.category === c.key && isLowOrOut(i),
              )
              return (
                <Tabs.Tab
                  key={c.key}
                  value={c.key}
                  color={c.color}
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
                  {c.label}
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
        placeholder={`Search ${CATEGORIES.find((c) => c.key === category)?.label.toLowerCase()}…`}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
        mb="md"
      />

      {query.isError ? (
        <Alert color="red" title="Couldn't load inventory">
          Something went wrong fetching your inventory. Try refreshing the page.
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
            ? 'No items yet — add one to get started.'
            : 'No items match your search.'}
        </Text>
      ) : view === 'table' ? (
        <InventoryTable
          items={filtered}
          category={category}
          onEdit={(item) => setModal({ mode: 'edit', item })}
        />
      ) : (
        <InventoryCardGrid
          items={filtered}
          category={category}
          onEdit={(item) => setModal({ mode: 'edit', item })}
        />
      )}

      {modal?.mode === 'create' && (
        <InventoryItemFormDrawer
          mode="create"
          category={category}
          onClose={() => setModal(null)}
        />
      )}
      {modal?.mode === 'edit' && (
        <InventoryItemFormDrawer
          mode="edit"
          item={modal.item}
          onClose={() => setModal(null)}
        />
      )}
    </PageTemplate>
  )
}
