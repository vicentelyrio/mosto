import { createFileRoute } from '@tanstack/react-router'

import { RecipeList } from '@features/recipes'

export const Route = createFileRoute('/_app/recipes/')({
  component: RecipeList,
})
