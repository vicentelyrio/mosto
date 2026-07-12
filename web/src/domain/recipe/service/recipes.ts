import { request } from '@domain/client'

import type { Recipe, RecipeInput } from '../entities'

export const fetchRecipes = (): Promise<Recipe[]> =>
  request('recipes_list', { method: 'GET', path: '/api/recipes' })

export const fetchRecipe = (id: string): Promise<Recipe> =>
  request('recipes_get', { method: 'GET', path: `/api/recipes/${id}` }, { id })

export const createRecipe = (body: RecipeInput): Promise<Recipe> =>
  request('recipes_create', { method: 'POST', path: '/api/recipes' }, { body })

export const updateRecipe = (id: string, body: RecipeInput): Promise<Recipe> =>
  request(
    'recipes_update',
    { method: 'PUT', path: `/api/recipes/${id}` },
    { id, body },
  )

export const deleteRecipe = (id: string): Promise<void> =>
  request(
    'recipes_delete',
    { method: 'DELETE', path: `/api/recipes/${id}` },
    { id },
  )
