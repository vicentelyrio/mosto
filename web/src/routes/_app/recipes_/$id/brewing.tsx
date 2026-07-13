import { createFileRoute } from '@tanstack/react-router'

import { BrewingPage } from '@features/brewday'

export const Route = createFileRoute('/_app/recipes_/$id/brewing')({
  component: BrewingRoute,
})

function BrewingRoute() {
  const { id } = Route.useParams()
  return <BrewingPage recipeId={id} />
}
