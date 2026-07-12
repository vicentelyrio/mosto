import {
  CookingPotIcon,
  DropIcon,
  FlaskIcon,
  GearIcon,
  type Icon,
  JarIcon,
  RulerIcon,
  SnowflakeIcon,
  WrenchIcon,
} from '@phosphor-icons/react'

import type { Condition } from '@domain'

export const TYPES = [
  'Mash Tun',
  'Kettle',
  'Chiller',
  'Fermentor',
  'Instrument',
  'Mill',
  'Pump',
] as const

export const TYPE_ICONS: Record<string, Icon> = {
  'Mash Tun': FlaskIcon,
  Kettle: CookingPotIcon,
  Chiller: SnowflakeIcon,
  Fermentor: JarIcon,
  Instrument: RulerIcon,
  Mill: GearIcon,
  Pump: DropIcon,
}

export const DEFAULT_TYPE_ICON = WrenchIcon

export const CONDITION_COLOR: Record<Condition, string> = {
  good: 'green',
  fair: 'orange',
  poor: 'red',
}

export const CONDITION_LABEL: Record<Condition, string> = {
  good: 'Good',
  fair: 'Fair',
  poor: 'Poor',
}
