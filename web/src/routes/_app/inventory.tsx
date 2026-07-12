import { createFileRoute, Outlet } from '@tanstack/react-router'

import { InventoryList } from '@features/inventory'

export const Route = createFileRoute('/_app/inventory')({
  component: InventoryLayout,
})

function InventoryLayout() {
  return (
    <>
      <InventoryList />
      <Outlet />
    </>
  )
}
