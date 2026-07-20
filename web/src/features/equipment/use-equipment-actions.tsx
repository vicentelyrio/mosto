import { useI18nContext } from '@i18n/i18n-react'
import type { TranslationFunctions } from '@i18n/i18n-types'

import { Text } from '@mantine/core'
import { modals } from '@mantine/modals'

import { ApiError, type Equipment, useEquipment } from '@domain'

function showActionError(
  LL: TranslationFunctions,
  title: string,
  err: unknown,
) {
  modals.open({
    title,
    children: (
      <Text size="sm" c="red">
        {err instanceof ApiError ? err.message : LL.common.somethingWrong()}
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
  const { LL } = useI18nContext()
  const { remove } = useEquipment()

  const edit = () => onEdit(item)

  const confirmDelete = () =>
    modals.openConfirmModal({
      title: LL.equipment.deleteConfirm.title(),
      children: (
        <Text size="sm">
          {LL.equipment.deleteConfirm.messagePrefix()}{' '}
          <strong>{item.name}</strong>
          {LL.equipment.deleteConfirm.messageSuffix()}
        </Text>
      ),
      labels: { confirm: LL.common.delete(), cancel: LL.common.cancel() },
      confirmProps: { color: 'red' },
      onConfirm: () =>
        remove.mutate(item.id, {
          onError: (err) =>
            showActionError(LL, LL.equipment.deleteError.title(), err),
        }),
    })

  return { edit, confirmDelete }
}
