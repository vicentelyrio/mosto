import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import type { Recipe, RecipeInput } from '../entities'
import {
  createRecipe,
  deleteRecipe,
  fetchRecipe,
  fetchRecipes,
  updateRecipe,
} from '../service'

export function useRecipes() {
  const qc = useQueryClient()
  const refresh = () => qc.invalidateQueries({ queryKey: ['recipes'] })

  const query = useQuery({ queryKey: ['recipes'], queryFn: fetchRecipes })

  const create = useMutation({
    mutationFn: (input: RecipeInput) => createRecipe(input),
    onSuccess: refresh,
  })

  const update = useMutation({
    mutationFn: ({ id, input }: { id: string; input: RecipeInput }) =>
      updateRecipe(id, input),
    onSuccess: refresh,
  })

  const remove = useMutation({
    mutationFn: (id: string) => deleteRecipe(id),
    onSuccess: refresh,
  })

  return { recipes: query.data ?? [], query, create, update, remove }
}

export function useRecipe(id: string | undefined) {
  return useQuery<Recipe>({
    queryKey: ['recipes', id],
    queryFn: () => fetchRecipe(id as string),
    enabled: id !== undefined,
  })
}
