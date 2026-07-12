import { createFileRoute } from '@tanstack/react-router'

import { RecipeDetail } from '@features/recipes'

export const Route = createFileRoute('/_app/recipes/$id')({
  component: () => {
    const { id } = Route.useParams()
    return <RecipeDetail id={id} />
  },
})
