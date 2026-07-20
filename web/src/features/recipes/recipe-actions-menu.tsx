import { useI18nContext } from '@i18n/i18n-react'

import { ActionIcon, Menu } from '@mantine/core'

import {
  CookingPotIcon,
  CopyIcon,
  DotsThreeVerticalIcon,
  DownloadSimpleIcon,
  PencilSimpleIcon,
  TrashIcon,
} from '@phosphor-icons/react'

import type { Recipe } from '@domain'

import { useRecipeActions } from './use-recipe-actions'

export function RecipeActionsMenu({
  recipe,
  onDeleted,
}: {
  recipe: Recipe
  onDeleted?: () => void
}) {
  const { LL } = useI18nContext()
  const { edit, startBrewing, isBrewing, clone, exportBeerXml, confirmDelete } =
    useRecipeActions(recipe, onDeleted)

  return (
    <Menu position="bottom-end" withinPortal>
      <Menu.Target>
        <ActionIcon
          variant="default"
          color="gray"
          aria-label={LL.recipes.actionsLabel()}
          onClick={(e) => e.stopPropagation()}
        >
          <DotsThreeVerticalIcon size={18} weight="bold" />
        </ActionIcon>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Item leftSection={<PencilSimpleIcon size={16} />} onClick={edit}>
          {LL.common.edit()}
        </Menu.Item>
        <Menu.Item
          leftSection={<CookingPotIcon size={16} />}
          onClick={startBrewing}
        >
          {isBrewing
            ? LL.recipes.actions.resumeBrewing()
            : LL.recipes.actions.startBrewing()}
        </Menu.Item>
        <Menu.Item leftSection={<CopyIcon size={16} />} onClick={clone}>
          {LL.recipes.actions.clone()}
        </Menu.Item>
        <Menu.Item
          leftSection={<DownloadSimpleIcon size={16} />}
          onClick={exportBeerXml}
        >
          {LL.recipes.actions.exportBeerXml()}
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
