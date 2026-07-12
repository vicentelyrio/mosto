import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import type { Equipment, EquipmentInput } from '../entities'
import {
  createEquipment,
  deleteEquipment,
  fetchEquipment,
  fetchEquipmentList,
  updateEquipment,
} from '../service'

export function useEquipment() {
  const qc = useQueryClient()
  const refresh = () => qc.invalidateQueries({ queryKey: ['equipment'] })

  const query = useQuery({
    queryKey: ['equipment'],
    queryFn: fetchEquipmentList,
  })

  const create = useMutation({
    mutationFn: (input: EquipmentInput) => createEquipment(input),
    onSuccess: refresh,
  })

  const update = useMutation({
    mutationFn: ({ id, input }: { id: string; input: EquipmentInput }) =>
      updateEquipment(id, input),
    onSuccess: refresh,
  })

  const remove = useMutation({
    mutationFn: (id: string) => deleteEquipment(id),
    onSuccess: refresh,
  })

  return { equipment: query.data ?? [], query, create, update, remove }
}

export function useEquipmentItem(id: string | undefined) {
  return useQuery<Equipment>({
    queryKey: ['equipment', id],
    queryFn: () => fetchEquipment(id as string),
    enabled: id !== undefined,
  })
}
