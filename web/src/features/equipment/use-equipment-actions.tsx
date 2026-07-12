import { Text } from '@mantine/core'
import { modals } from '@mantine/modals'

import { ApiError, type Equipment, useEquipment } from '@domain'

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

/** Shared equipment actions (edit/delete) used by the card's actions menu.
 *  Editing has no dedicated route — it just hands the item back to the
 *  caller, which opens the shared form drawer already on the page. */
export function useEquipmentActions(
  item: Equipment,
  onEdit: (item: Equipment) => void,
) {
  const { remove } = useEquipment()

  const edit = () => onEdit(item)

  const confirmDelete = () =>
    modals.openConfirmModal({
      title: 'Delete equipment',
      children: (
        <Text size="sm">
          Delete <strong>{item.name}</strong>? This can't be undone.
        </Text>
      ),
      labels: { confirm: 'Delete', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: () =>
        remove.mutate(item.id, {
          onError: (err) => showActionError("Couldn't delete equipment", err),
        }),
    })

  return { edit, confirmDelete }
}
