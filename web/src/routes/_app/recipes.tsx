import { createFileRoute, Outlet } from '@tanstack/react-router'

import { RecipeList } from '@features/recipes'

export const Route = createFileRoute('/_app/recipes')({
  component: RecipesLayout,
})

function RecipesLayout() {
  return (
    <>
      <RecipeList />
      <Outlet />
    </>
  )
}
