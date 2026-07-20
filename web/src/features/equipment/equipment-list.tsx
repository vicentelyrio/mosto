import { useState } from 'react'

import { useI18nContext } from '@i18n/i18n-react'
import { paths } from '@infrastructure'
import { useNavigate } from '@tanstack/react-router'

import { Alert, Button, Skeleton, Tabs, Text } from '@mantine/core'

import { PlusIcon } from '@phosphor-icons/react'

import { type Condition, type Equipment, useEquipment } from '@domain'

import { CardGrid } from '@templates/card-grid'
import { PageTemplate } from '@templates/page-template'

import { EquipmentCard } from './equipment-card'

const CONDITIONS: Condition[] = ['good', 'fair', 'poor']

export function EquipmentList() {
  const { LL } = useI18nContext()
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
      title={LL.equipment.list.title()}
      subtitle={
        query.isSuccess
          ? CONDITIONS.map(
              (c) =>
                `${equipment.filter((e) => e.condition === c).length} ${LL.equipment.condition[c]().toLowerCase()}`,
            ).join(' · ')
          : undefined
      }
      actions={
        <Button
          leftSection={<PlusIcon size={16} weight="bold" />}
          onClick={() => navigate({ to: paths.newEquipment })}
        >
          {LL.equipment.list.addButton()}
        </Button>
      }
    >
      <Tabs value={filter} onChange={(v) => setFilter(v ?? 'all')} mb="lg">
        <Tabs.List>
          {types.map((t) => (
            <Tabs.Tab key={t} value={t}>
              {t === 'all' ? LL.equipment.list.all() : t}
            </Tabs.Tab>
          ))}
        </Tabs.List>
      </Tabs>

      {query.isError ? (
        <Alert color="red" title={LL.equipment.list.loadError.title()}>
          {LL.equipment.list.loadError.message()}
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
            ? LL.equipment.list.empty()
            : LL.equipment.list.emptyFiltered()}
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
