import { paths } from '@infrastructure'
import { createFileRoute, useNavigate } from '@tanstack/react-router'

import type { InventoryCategory } from '@domain'

import { InventoryItemFormDrawer } from '@features/inventory'

interface NewInventoryItemSearch {
  category?: InventoryCategory
}

export const Route = createFileRoute('/_app/inventory/new')({
  validateSearch: (
    search: Record<string, unknown>,
  ): NewInventoryItemSearch => ({
    category: search.category as InventoryCategory | undefined,
  }),
  component: NewInventoryItem,
})

function NewInventoryItem() {
  const navigate = useNavigate()
  const { category } = Route.useSearch()

  return (
    <InventoryItemFormDrawer
      mode="create"
      category={category ?? 'grain'}
      onClose={() => navigate({ to: paths.inventory })}
    />
  )
}
