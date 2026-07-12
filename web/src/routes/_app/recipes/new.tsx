import { createFileRoute } from '@tanstack/react-router'

import { RecipeFormDrawer } from '@features/recipes'

export const Route = createFileRoute('/_app/recipes/new')({
  component: NewRecipe,
})

function NewRecipe() {
  return <RecipeFormDrawer mode="create" />
}
