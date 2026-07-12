import { createFileRoute, Outlet } from '@tanstack/react-router'

import { EquipmentList } from '@features/equipment'

export const Route = createFileRoute('/_app/equipment')({
  component: EquipmentLayout,
})

function EquipmentLayout() {
  return (
    <>
      <EquipmentList />
      <Outlet />
    </>
  )
}
