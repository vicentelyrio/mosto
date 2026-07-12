import { createFileRoute } from '@tanstack/react-router'

import { EquipmentEditDrawer } from '@features/equipment'

export const Route = createFileRoute('/_app/equipment/$id')({
  component: EquipmentEditRoute,
})

function EquipmentEditRoute() {
  const { id } = Route.useParams()
  return <EquipmentEditDrawer id={id} />
}
