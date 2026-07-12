export type Condition = 'good' | 'fair' | 'poor'

export interface Equipment {
  id: string
  name: string
  type: string
  capacity: string
  material: string
  condition: Condition
  notes: string
  created_at: number
}

/** Create/update payload — same shape as `Equipment` minus server-assigned fields. */
export type EquipmentInput = Omit<Equipment, 'id' | 'created_at'>
