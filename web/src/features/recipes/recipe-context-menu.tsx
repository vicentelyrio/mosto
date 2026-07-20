import { type ReactNode, useState } from 'react'

import { useI18nContext } from '@i18n/i18n-react'

import { Box, Menu } from '@mantine/core'

import {
  CookingPotIcon,
  CopyIcon,
  DownloadSimpleIcon,
  PencilSimpleIcon,
  TrashIcon,
} from '@phosphor-icons/react'

import type { Recipe } from '@domain'

import { useRecipeActions } from './use-recipe-actions'

/** Wraps its children with a right-click context menu offering the same
 *  actions as the kebab menu, plus "Start Brewing". */
export function RecipeContextMenu({
  recipe,
  onDeleted,
  children,
}: {
  recipe: Recipe
  onDeleted?: () => void
  children: ReactNode
}) {
  const { LL } = useI18nContext()
  const [point, setPoint] = useState<{ x: number; y: number } | null>(null)
  const { edit, startBrewing, isBrewing, clone, exportBeerXml, confirmDelete } =
    useRecipeActions(recipe, onDeleted)

  return (
    <>
      <Box
        onContextMenu={(e) => {
          e.preventDefault()
          setPoint({ x: e.clientX, y: e.clientY })
        }}
      >
        {children}
      </Box>

      <Menu
        opened={!!point}
        onClose={() => setPoint(null)}
        position="bottom-start"
        withinPortal
      >
        <Menu.Target>
          <Box
            pos="fixed"
            top={point?.y ?? 0}
            left={point?.x ?? 0}
            w={1}
            h={1}
          />
        </Menu.Target>
        <Menu.Dropdown>
          <Menu.Item
            leftSection={<PencilSimpleIcon size={16} />}
            onClick={edit}
          >
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
    </>
  )
}
