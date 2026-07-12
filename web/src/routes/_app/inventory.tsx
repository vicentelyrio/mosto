import { createFileRoute } from '@tanstack/react-router'

import { InventoryList } from '@features/inventory'

export const Route = createFileRoute('/_app/inventory')({
  component: InventoryList,
})
