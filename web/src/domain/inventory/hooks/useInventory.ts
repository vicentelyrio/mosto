import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import type { InventoryItem, InventoryItemInput } from '../entities'
import {
  createInventoryItem,
  deleteInventoryItem,
  fetchInventory,
  fetchInventoryItem,
  updateInventoryItem,
} from '../service'

export function useInventory() {
  const qc = useQueryClient()
  const refresh = () => qc.invalidateQueries({ queryKey: ['inventory'] })

  const query = useQuery({ queryKey: ['inventory'], queryFn: fetchInventory })

  const create = useMutation({
    mutationFn: (input: InventoryItemInput) => createInventoryItem(input),
    onSuccess: refresh,
  })

  const update = useMutation({
    mutationFn: ({ id, input }: { id: string; input: InventoryItemInput }) =>
      updateInventoryItem(id, input),
    onSuccess: refresh,
  })

  const remove = useMutation({
    mutationFn: (id: string) => deleteInventoryItem(id),
    onSuccess: refresh,
  })

  return { items: query.data ?? [], query, create, update, remove }
}

export function useInventoryItem(id: string | undefined) {
  return useQuery<InventoryItem>({
    queryKey: ['inventory', id],
    queryFn: () => fetchInventoryItem(id as string),
    enabled: id !== undefined,
  })
}
