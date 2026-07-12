import { request } from '@domain/client'

import type { InventoryItem, InventoryItemInput } from '../entities'

export const fetchInventory = (): Promise<InventoryItem[]> =>
  request('inventory_list', { method: 'GET', path: '/api/inventory' })

export const fetchInventoryItem = (id: string): Promise<InventoryItem> =>
  request(
    'inventory_get',
    { method: 'GET', path: `/api/inventory/${id}` },
    { id },
  )

export const createInventoryItem = (
  body: InventoryItemInput,
): Promise<InventoryItem> =>
  request(
    'inventory_create',
    { method: 'POST', path: '/api/inventory' },
    { body },
  )

export const updateInventoryItem = (
  id: string,
  body: InventoryItemInput,
): Promise<InventoryItem> =>
  request(
    'inventory_update',
    { method: 'PUT', path: `/api/inventory/${id}` },
    { id, body },
  )

export const deleteInventoryItem = (id: string): Promise<void> =>
  request(
    'inventory_delete',
    { method: 'DELETE', path: `/api/inventory/${id}` },
    { id },
  )
