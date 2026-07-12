import { paths } from '@infrastructure'
import { createFileRoute, useNavigate } from '@tanstack/react-router'

import { EquipmentFormDrawer } from '@features/equipment'

export const Route = createFileRoute('/_app/equipment/new')({
  component: NewEquipment,
})

function NewEquipment() {
  const navigate = useNavigate()

  return (
    <EquipmentFormDrawer
      mode="create"
      onClose={() => navigate({ to: paths.equipment })}
    />
  )
}
