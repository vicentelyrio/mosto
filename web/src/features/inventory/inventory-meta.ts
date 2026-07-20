import type { TranslationFunctions } from '@i18n/i18n-types'
import dayjs from 'dayjs'

import type { InventoryCategory, InventoryItem } from '@domain'

/** Display order for category tabs/selects. Labels are looked up from
 *  translations via `LL.inventory.category[key]()` at the call site. */
export const CATEGORY_KEYS: InventoryCategory[] = [
  'grain',
  'hop',
  'yeast',
  'adjunct',
  'water_chem',
  'packaging',
]

export const CATEGORY_COLORS: Record<InventoryCategory, string> = {
  grain: 'amber',
  hop: 'green',
  yeast: 'yellow',
  adjunct: 'grape',
  water_chem: 'blue',
  packaging: 'gray',
}

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

/** Days until expiry, or null if the item has no expiry date. */
export function daysUntilExpiry(expiry: string | null): number | null {
  if (!expiry) return null
  return dayjs(expiry).diff(dayjs(), 'day')
}

/** Only worth flagging within ~90 days of expiring (or already expired). */
export function expiryBadge(
  LL: TranslationFunctions,
  expiry: string | null,
): { label: string; color: string } | null {
  const days = daysUntilExpiry(expiry)
  if (days === null || days > 90) return null
  if (days < 0) return { label: LL.inventory.expiry.expired(), color: 'red' }
  if (days < 30)
    return { label: LL.inventory.expiry.daysShort({ days }), color: 'orange' }
  return { label: LL.inventory.expiry.daysShort({ days }), color: 'gray' }
}
