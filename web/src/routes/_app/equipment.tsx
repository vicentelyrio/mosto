import { createFileRoute } from '@tanstack/react-router'

import { EquipmentList } from '@features/equipment'

export const Route = createFileRoute('/_app/equipment')({
  component: EquipmentList,
})
