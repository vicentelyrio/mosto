import { type ReactNode, useState } from 'react'

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
 *  actions as the kebab menu, plus "Start Brew Day". */
export function RecipeContextMenu({
  recipe,
  onDeleted,
  children,
}: {
  recipe: Recipe
  onDeleted?: () => void
  children: ReactNode
}) {
  const [point, setPoint] = useState<{ x: number; y: number } | null>(null)
  const { edit, startBrewDay, clone, exportBeerXml, confirmDelete } =
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
            Edit
          </Menu.Item>
          <Menu.Item
            leftSection={<CookingPotIcon size={16} />}
            onClick={startBrewDay}
          >
            Start Brew Day
          </Menu.Item>
          <Menu.Item leftSection={<CopyIcon size={16} />} onClick={clone}>
            Clone
          </Menu.Item>
          <Menu.Item
            leftSection={<DownloadSimpleIcon size={16} />}
            onClick={exportBeerXml}
          >
            Export BeerXML
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
    </>
  )
}
