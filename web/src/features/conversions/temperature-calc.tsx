import { useState } from 'react'

import { useI18nContext } from '@i18n/i18n-react'

import { Button, Group, SimpleGrid } from '@mantine/core'

import { CalcCard } from './calc-card'
import { CalcField } from './calc-field'
import { cToF, fToC } from './calculations'

export function TemperatureCalc() {
  const { LL } = useI18nContext()
  const [f, setF] = useState<number | ''>(152)

  const PRESETS: [string, number][] = [
    [LL.conversions.temperature.presets.mash(), 152],
    [LL.conversions.temperature.presets.sparge(), 168],
    [LL.conversions.temperature.presets.pitchAle(), 68],
    [LL.conversions.temperature.presets.pitchLager(), 50],
    [LL.conversions.temperature.presets.ferment(), 68],
  ]

  const setFahrenheit = (v: number | '') => setF(v)
  const setCelsius = (v: number | '') =>
    setF(v === '' ? '' : Number(cToF(v).toFixed(1)))

  const c = f === '' ? '' : Number(fToC(f).toFixed(1))

  return (
    <CalcCard title={LL.conversions.temperature.title()}>
      <SimpleGrid cols={2}>
        <CalcField
          label={LL.conversions.temperature.fahrenheitLabel()}
          value={f}
          onChange={setFahrenheit}
          unit="°F"
          decimalScale={1}
          highlight
        />
        <CalcField
          label={LL.conversions.temperature.celsiusLabel()}
          value={c}
          onChange={setCelsius}
          unit="°C"
          decimalScale={1}
          highlight
        />
      </SimpleGrid>
      <Group gap="xs">
        {PRESETS.map(([label, temp]) => (
          <Button
            key={label}
            variant="default"
            size="xs"
            onClick={() => setFahrenheit(temp)}
          >
            {LL.conversions.temperature.presetButton({ label, temp })}
          </Button>
        ))}
      </Group>
    </CalcCard>
  )
}
