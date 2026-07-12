import { useState } from 'react'

import { paths } from '@infrastructure'
import { useNavigate } from '@tanstack/react-router'

import { Alert, Button, Skeleton, Tabs, Text } from '@mantine/core'

import { PlusIcon } from '@phosphor-icons/react'

import { type Condition, type Equipment, useEquipment } from '@domain'

import { CardGrid } from '@templates/card-grid'
import { PageTemplate } from '@templates/page-template'

import { EquipmentCard } from './equipment-card'
import { CONDITION_LABEL } from './equipment-meta'

const CONDITIONS: Condition[] = ['good', 'fair', 'poor']

export function EquipmentList() {
  const navigate = useNavigate()
  const { equipment, query } = useEquipment()
  const [filter, setFilter] = useState('all')

  const types = ['all', ...new Set(equipment.map((e) => e.type))]
  const filtered =
    filter === 'all' ? equipment : equipment.filter((e) => e.type === filter)

  const editItem = (item: Equipment) =>
    navigate({ to: paths.equipmentDetail, params: { id: item.id } })

  return (
    <PageTemplate
      title="Equipment"
      subtitle={
        query.isSuccess
          ? CONDITIONS.map(
              (c) =>
                `${equipment.filter((e) => e.condition === c).length} ${CONDITION_LABEL[c].toLowerCase()}`,
            ).join(' · ')
          : undefined
      }
      actions={
        <Button
          leftSection={<PlusIcon size={16} weight="bold" />}
          onClick={() => navigate({ to: paths.newEquipment })}
        >
          Add Equipment
        </Button>
      }
    >
      <Tabs value={filter} onChange={(v) => setFilter(v ?? 'all')} mb="lg">
        <Tabs.List>
          {types.map((t) => (
            <Tabs.Tab key={t} value={t}>
              {t === 'all' ? 'All' : t}
            </Tabs.Tab>
          ))}
        </Tabs.List>
      </Tabs>

      {query.isError ? (
        <Alert color="red" title="Couldn't load equipment">
          Something went wrong fetching your equipment. Try refreshing the page.
        </Alert>
      ) : query.isLoading ? (
        <CardGrid>
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} height="9.5rem" radius="lg" />
          ))}
        </CardGrid>
      ) : filtered.length === 0 ? (
        <Text c="dimmed" ta="center" py="xl">
          {equipment.length === 0
            ? 'No equipment yet — add some to get started.'
            : 'No equipment matches this filter.'}
        </Text>
      ) : (
        <CardGrid>
          {filtered.map((item) => (
            <EquipmentCard key={item.id} item={item} onEdit={editItem} />
          ))}
        </CardGrid>
      )}
    </PageTemplate>
  )
}
