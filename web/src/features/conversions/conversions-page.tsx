import { useState } from 'react'

import { Tabs } from '@mantine/core'

import { PageTemplate } from '@templates/page-template'

import { AbvCalc } from './abv-calc'
import { ColorCalc } from './color-calc'
import { GravityCalc } from './gravity-calc'
import { TemperatureCalc } from './temperature-calc'
import { VolumeCalc } from './volume-calc'
import { WaterCalc } from './water-calc'
import { WeightCalc } from './weight-calc'

const TABS = [
  { value: 'gravity', label: 'Gravity', Panel: GravityCalc },
  { value: 'temperature', label: 'Temperature', Panel: TemperatureCalc },
  { value: 'volume', label: 'Volume', Panel: VolumeCalc },
  { value: 'weight', label: 'Weight', Panel: WeightCalc },
  { value: 'abv', label: 'ABV/ABW', Panel: AbvCalc },
  { value: 'color', label: 'Color', Panel: ColorCalc },
  { value: 'water', label: 'Water', Panel: WaterCalc },
] as const

export function ConversionsPage() {
  const [tab, setTab] = useState<string>('gravity')

  return (
    <PageTemplate
      title="Conversions"
      subtitle="Brewing calculators & unit converters"
    >
      <Tabs value={tab} onChange={(v) => setTab(v ?? 'gravity')} mb="lg">
        <Tabs.List>
          {TABS.map((t) => (
            <Tabs.Tab key={t.value} value={t.value}>
              {t.label}
            </Tabs.Tab>
          ))}
        </Tabs.List>
      </Tabs>

      {TABS.map((t) => tab === t.value && <t.Panel key={t.value} />)}
    </PageTemplate>
  )
}
