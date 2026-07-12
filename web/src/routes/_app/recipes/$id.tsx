import { createFileRoute } from '@tanstack/react-router'

import { RecipeDetailDrawer } from '@features/recipes'

interface RecipeDetailSearch {
  edit?: boolean
}

export const Route = createFileRoute('/_app/recipes/$id')({
  validateSearch: (search: Record<string, unknown>): RecipeDetailSearch => ({
    edit: search.edit === true || search.edit === 'true' || undefined,
  }),
  component: RecipeDetailRoute,
})

function RecipeDetailRoute() {
  const { id } = Route.useParams()
  const { edit } = Route.useSearch()
  return <RecipeDetailDrawer id={id} editing={!!edit} />
}
