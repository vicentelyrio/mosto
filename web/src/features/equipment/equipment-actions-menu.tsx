import { ActionIcon, Menu } from '@mantine/core'

import {
  DotsThreeVerticalIcon,
  PencilSimpleIcon,
  TrashIcon,
} from '@phosphor-icons/react'

import type { Equipment } from '@domain'

import { useEquipmentActions } from './use-equipment-actions'

export function EquipmentActionsMenu({
  item,
  onEdit,
}: {
  item: Equipment
  onEdit: (item: Equipment) => void
}) {
  const { edit, confirmDelete } = useEquipmentActions(item, onEdit)

  return (
    <Menu position="bottom-end" withinPortal>
      <Menu.Target>
        <ActionIcon
          variant="default"
          color="gray"
          aria-label="Equipment actions"
          onClick={(e) => e.stopPropagation()}
        >
          <DotsThreeVerticalIcon size={18} weight="bold" />
        </ActionIcon>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Item leftSection={<PencilSimpleIcon size={16} />} onClick={edit}>
          Edit
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item
          color="red"
          leftSection={<TrashIcon size={16} />}
          onClick={confirmDelete}
        >
          Delete
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  )
}
