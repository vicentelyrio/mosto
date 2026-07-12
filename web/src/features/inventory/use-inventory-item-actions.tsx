import { Text } from '@mantine/core'
import { modals } from '@mantine/modals'

import { ApiError, type InventoryItem, useInventory } from '@domain'

function showActionError(title: string, err: unknown) {
  modals.open({
    title,
    children: (
      <Text size="sm" c="red">
        {err instanceof ApiError ? err.message : 'Something went wrong.'}
      </Text>
    ),
  })
}

/** Shared inventory item actions (edit/delete) used by both the table row
 *  menu and the card's actions menu, so the mutation logic only lives once.
 *  Editing has no dedicated route — it just hands the item back to the
 *  caller, which opens the shared form modal already on the page. */
export function useInventoryItemActions(
  item: InventoryItem,
  onEdit: (item: InventoryItem) => void,
) {
  const { remove } = useInventory()

  const edit = () => onEdit(item)

  const confirmDelete = () =>
    modals.openConfirmModal({
      title: 'Delete item',
      children: (
        <Text size="sm">
          Delete <strong>{item.name}</strong>? This can't be undone.
        </Text>
      ),
      labels: { confirm: 'Delete', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: () =>
        remove.mutate(item.id, {
          onError: (err) => showActionError("Couldn't delete item", err),
        }),
    })

  return { edit, confirmDelete }
}
