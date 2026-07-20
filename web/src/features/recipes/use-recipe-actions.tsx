import { useI18nContext } from '@i18n/i18n-react'
import type { TranslationFunctions } from '@i18n/i18n-types'
import { paths } from '@infrastructure'
import { useNavigate } from '@tanstack/react-router'

import { Text } from '@mantine/core'
import { modals } from '@mantine/modals'

import {
  ApiError,
  downloadBeerXml,
  type Recipe,
  useBrewSessions,
  useRecipes,
} from '@domain'

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

/** Shared recipe actions (edit/brewing/clone/export/delete) used by both
 *  the kebab menu and the card's right-click context menu, so the mutation
 *  and navigation logic only lives in one place. */
export function useRecipeActions(recipe: Recipe, onDeleted?: () => void) {
  const { LL } = useI18nContext()
  const navigate = useNavigate()
  const { create, remove } = useRecipes()
  const { sessions, create: createSession } = useBrewSessions()

  const activeSession = sessions.find(
    (s) => s.recipe_id === recipe.id && s.status !== 'archived',
  )
  const isBrewing = !!activeSession

  const edit = () =>
    navigate({
      to: paths.recipeDetail,
      params: { id: recipe.id },
      search: { edit: true },
    })

  const goToBrewing = () =>
    navigate({ to: paths.recipeBrewing, params: { id: recipe.id } })

  const startBrewing = () => {
    if (activeSession) {
      goToBrewing()
      return
    }
    createSession.mutate(
      {
        recipe_id: recipe.id,
        status: 'brewing',
        started_at: Math.floor(Date.now() / 1000),
      },
      {
        onSuccess: goToBrewing,
        onError: (err) =>
          showActionError(LL, LL.recipes.startBrewingError(), err),
      },
    )
  }

  const clone = () => {
    const { id: _id, created_at: _createdAt, ...input } = recipe
    create.mutate(
      { ...input, name: `${recipe.name}${LL.recipes.cloneSuffix()}` },
      {
        onSuccess: (created) =>
          navigate({ to: paths.recipeDetail, params: { id: created.id } }),
        onError: (err) => showActionError(LL, LL.recipes.cloneError(), err),
      },
    )
  }

  const exportBeerXml = () => downloadBeerXml(recipe)

  const confirmDelete = () =>
    modals.openConfirmModal({
      title: LL.recipes.deleteConfirm.title(),
      children: (
        <Text size="sm">
          {LL.recipes.deleteConfirm.messagePrefix()}{' '}
          <strong>{recipe.name}</strong>
          {LL.recipes.deleteConfirm.messageSuffix()}
        </Text>
      ),
      labels: { confirm: LL.common.delete(), cancel: LL.common.cancel() },
      confirmProps: { color: 'red' },
      onConfirm: () =>
        remove.mutate(recipe.id, {
          onSuccess: onDeleted,
          onError: (err) =>
            showActionError(LL, LL.recipes.deleteError.title(), err),
        }),
    })

  return { edit, startBrewing, isBrewing, clone, exportBeerXml, confirmDelete }
}
