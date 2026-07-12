import { paths } from '@infrastructure'
import { useNavigate } from '@tanstack/react-router'

import { Text } from '@mantine/core'
import { modals } from '@mantine/modals'

import { downloadBeerXml, type Recipe, useRecipes } from '@domain'

/** Shared recipe actions (edit/brew day/clone/export/delete) used by both
 *  the kebab menu and the card's right-click context menu, so the mutation
 *  and navigation logic only lives in one place. */
export function useRecipeActions(recipe: Recipe, onDeleted?: () => void) {
  const navigate = useNavigate()
  const { create, remove } = useRecipes()

  const edit = () =>
    navigate({
      to: paths.recipeDetail,
      params: { id: recipe.id },
      search: { edit: true },
    })

  const startBrewDay = () => navigate({ to: paths.brewday })

  const clone = () => {
    const { id: _id, created_at: _createdAt, ...input } = recipe
    create.mutate(
      { ...input, name: `${recipe.name} (Copy)` },
      {
        onSuccess: (created) =>
          navigate({ to: paths.recipeDetail, params: { id: created.id } }),
      },
    )
  }

  const exportBeerXml = () => downloadBeerXml(recipe)

  const confirmDelete = () =>
    modals.openConfirmModal({
      title: 'Delete recipe',
      children: (
        <Text size="sm">
          Delete <strong>{recipe.name}</strong>? This can't be undone.
        </Text>
      ),
      labels: { confirm: 'Delete', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: () => remove.mutate(recipe.id, { onSuccess: onDeleted }),
    })

  return { edit, startBrewDay, clone, exportBeerXml, confirmDelete }
}
