export type InventoryCategory =
  | 'grain'
  | 'hop'
  | 'yeast'
  | 'adjunct'
  | 'water_chem'
  | 'packaging'

export interface InventoryItem {
  id: string
  category: InventoryCategory
  name: string
  amount: number
  unit: string
  low_threshold: number | null
  expiry: string | null
  // Category-specific, so only ever some of these are populated.
  brand: string | null
  alpha: number | null
  form: string | null
  attenuation: string | null
  created_at: number
}

/** Create/update payload — same shape as `InventoryItem` minus server-assigned fields. */
export type InventoryItemInput = Omit<InventoryItem, 'id' | 'created_at'>
