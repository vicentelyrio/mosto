import { useState } from 'react'

import { useI18nContext } from '@i18n/i18n-react'

import { Tabs } from '@mantine/core'

import { PageTemplate } from '@templates/page-template'

import { AbvCalc } from './abv-calc'
import { ColorCalc } from './color-calc'
import { GravityCalc } from './gravity-calc'
import { TemperatureCalc } from './temperature-calc'
import { VolumeCalc } from './volume-calc'
import { WaterCalc } from './water-calc'
import { WeightCalc } from './weight-calc'

export function ConversionsPage() {
  const { LL } = useI18nContext()
  const [tab, setTab] = useState<string>('gravity')

  const TABS = [
    {
      value: 'gravity',
      label: LL.conversions.tabs.gravity(),
      Panel: GravityCalc,
    },
    {
      value: 'temperature',
      label: LL.conversions.tabs.temperature(),
      Panel: TemperatureCalc,
    },
    { value: 'volume', label: LL.conversions.tabs.volume(), Panel: VolumeCalc },
    { value: 'weight', label: LL.conversions.tabs.weight(), Panel: WeightCalc },
    { value: 'abv', label: LL.conversions.tabs.abv(), Panel: AbvCalc },
    { value: 'color', label: LL.conversions.tabs.color(), Panel: ColorCalc },
    { value: 'water', label: LL.conversions.tabs.water(), Panel: WaterCalc },
  ] as const

  return (
    <PageTemplate
      title={LL.nav.conversions()}
      subtitle={LL.conversions.subtitle()}
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
