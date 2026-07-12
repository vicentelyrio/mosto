import { useState } from 'react'

import { Button, Group, SimpleGrid } from '@mantine/core'

import { CalcCard } from './calc-card'
import { CalcField } from './calc-field'
import { cToF, fToC } from './calculations'

const PRESETS: [string, number][] = [
  ['Mash', 152],
  ['Sparge', 168],
  ['Pitch Ale', 68],
  ['Pitch Lager', 50],
  ['Ferment', 68],
]

export function TemperatureCalc() {
  const [f, setF] = useState<number | ''>(152)

  const setFahrenheit = (v: number | '') => setF(v)
  const setCelsius = (v: number | '') =>
    setF(v === '' ? '' : Number(cToF(v).toFixed(1)))

  const c = f === '' ? '' : Number(fToC(f).toFixed(1))

  return (
    <CalcCard title="Temperature">
      <SimpleGrid cols={2}>
        <CalcField
          label="Fahrenheit"
          value={f}
          onChange={setFahrenheit}
          unit="°F"
          decimalScale={1}
          highlight
        />
        <CalcField
          label="Celsius"
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
            {label} ({temp}°F)
          </Button>
        ))}
      </Group>
    </CalcCard>
  )
}
