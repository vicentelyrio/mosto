import dayjs from 'dayjs'

import type { InventoryCategory, InventoryItem } from '@domain'

export const CATEGORIES: {
  key: InventoryCategory
  label: string
  color: string
}[] = [
  { key: 'grain', label: 'Grains', color: 'amber' },
  { key: 'hop', label: 'Hops', color: 'green' },
  { key: 'yeast', label: 'Yeast', color: 'yellow' },
  { key: 'adjunct', label: 'Adjuncts', color: 'grape' },
  { key: 'water_chem', label: 'Water Chem', color: 'blue' },
  { key: 'packaging', label: 'Packaging', color: 'gray' },
]

export const CATEGORY_LABELS: Record<InventoryCategory, string> =
  Object.fromEntries(CATEGORIES.map((c) => [c.key, c.label])) as Record<
    InventoryCategory,
    string
  >

export const CATEGORY_COLORS: Record<InventoryCategory, string> =
  Object.fromEntries(CATEGORIES.map((c) => [c.key, c.color])) as Record<
    InventoryCategory,
    string
  >

export const UNITS = [
  'lb',
  'oz',
  'g',
  'kg',
  'pkg',
  'mL',
  'gal',
  'pcs',
  'tablet',
  'jar',
] as const

export type ItemStatus = 'out' | 'low' | 'ok'

export function itemStatus(item: InventoryItem): ItemStatus {
  if (item.amount === 0) return 'out'
  if (item.low_threshold != null && item.amount <= item.low_threshold)
    return 'low'
  return 'ok'
}

export function isLowOrOut(item: InventoryItem): boolean {
  return itemStatus(item) !== 'ok'
}

export const STATUS_COLOR: Record<ItemStatus, string> = {
  out: 'red',
  low: 'orange',
  ok: 'green',
}

export const STATUS_LABEL: Record<ItemStatus, string> = {
  out: 'Out of stock',
  low: 'Low',
  ok: 'In stock',
}

/** Days until expiry, or null if the item has no expiry date. */
export function daysUntilExpiry(expiry: string | null): number | null {
  if (!expiry) return null
  return dayjs(expiry).diff(dayjs(), 'day')
}

/** Only worth flagging within ~90 days of expiring (or already expired). */
export function expiryBadge(
  expiry: string | null,
): { label: string; color: string } | null {
  const days = daysUntilExpiry(expiry)
  if (days === null || days > 90) return null
  if (days < 0) return { label: 'Expired', color: 'red' }
  if (days < 30) return { label: `${days}d`, color: 'orange' }
  return { label: `${days}d`, color: 'gray' }
}
