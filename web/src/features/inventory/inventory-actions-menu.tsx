import { useI18nContext } from '@i18n/i18n-react'

import { ActionIcon, Menu } from '@mantine/core'

import {
  DotsThreeVerticalIcon,
  PencilSimpleIcon,
  TrashIcon,
} from '@phosphor-icons/react'

import type { InventoryItem } from '@domain'

import { useInventoryItemActions } from './use-inventory-item-actions'

export function InventoryActionsMenu({
  item,
  onEdit,
}: {
  item: InventoryItem
  onEdit: (item: InventoryItem) => void
}) {
  const { LL } = useI18nContext()
  const { edit, confirmDelete } = useInventoryItemActions(item, onEdit)

  return (
    <Menu position="bottom-end" withinPortal>
      <Menu.Target>
        <ActionIcon
          variant="default"
          color="gray"
          aria-label={LL.inventory.actionsLabel()}
          onClick={(e) => e.stopPropagation()}
        >
          <DotsThreeVerticalIcon size={18} weight="bold" />
        </ActionIcon>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Item leftSection={<PencilSimpleIcon size={16} />} onClick={edit}>
          {LL.common.edit()}
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item
          color="red"
          leftSection={<TrashIcon size={16} />}
          onClick={confirmDelete}
        >
          {LL.common.delete()}
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  )
}
