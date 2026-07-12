import { createFileRoute } from '@tanstack/react-router'

import { InventoryItemEditDrawer } from '@features/inventory'

export const Route = createFileRoute('/_app/inventory/$id')({
  component: InventoryItemEditRoute,
})

function InventoryItemEditRoute() {
  const { id } = Route.useParams()
  return <InventoryItemEditDrawer id={id} />
}
