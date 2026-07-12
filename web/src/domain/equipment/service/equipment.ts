import { request } from '@domain/client'

import type { Equipment, EquipmentInput } from '../entities'

export const fetchEquipmentList = (): Promise<Equipment[]> =>
  request('equipment_list', { method: 'GET', path: '/api/equipment' })

export const fetchEquipment = (id: string): Promise<Equipment> =>
  request(
    'equipment_get',
    { method: 'GET', path: `/api/equipment/${id}` },
    { id },
  )

export const createEquipment = (body: EquipmentInput): Promise<Equipment> =>
  request(
    'equipment_create',
    { method: 'POST', path: '/api/equipment' },
    { body },
  )

export const updateEquipment = (
  id: string,
  body: EquipmentInput,
): Promise<Equipment> =>
  request(
    'equipment_update',
    { method: 'PUT', path: `/api/equipment/${id}` },
    { id, body },
  )

export const deleteEquipment = (id: string): Promise<void> =>
  request(
    'equipment_delete',
    { method: 'DELETE', path: `/api/equipment/${id}` },
    { id },
  )
