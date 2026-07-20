import { useState } from 'react'

import { useI18nContext } from '@i18n/i18n-react'

import {
  Badge,
  Group,
  NumberInput,
  Progress,
  SimpleGrid,
  Stack,
  Text,
} from '@mantine/core'

import { CalcCard } from './calc-card'
import type { WaterIonProfile } from './calculations'
import { sulfateChlorideProfile, WATER_ION_RANGES } from './calculations'

const ION_LABELS: Record<keyof WaterIonProfile, string> = {
  ca: 'Ca²⁺',
  mg: 'Mg²⁺',
  na: 'Na⁺',
  so4: 'SO₄²⁻',
  cl: 'Cl⁻',
}

export function WaterCalc() {
  const { LL } = useI18nContext()
  const [volume, setVolume] = useState<number | ''>(7.5)
  const [ph, setPh] = useState<number | ''>(5.4)
  const [ions, setIons] = useState<WaterIonProfile>({
    ca: 75,
    mg: 5,
    na: 15,
    so4: 150,
    cl: 50,
  })

  const setIon = (key: keyof WaterIonProfile, value: number | '') =>
    setIons((prev) => ({ ...prev, [key]: value === '' ? 0 : value }))

  const profile = sulfateChlorideProfile(LL, ions.so4, ions.cl)
  const ratio = ions.so4 / (ions.cl || 1)

  return (
    <CalcCard title={LL.conversions.water.title()}>
      <SimpleGrid cols={2}>
        <NumberInput
          label={LL.conversions.water.volumeLabel()}
          value={volume}
          onChange={(v) => setVolume(v === '' ? '' : Number(v))}
          hideControls
        />
        <NumberInput
          label={LL.conversions.water.phTargetLabel()}
          value={ph}
          onChange={(v) => setPh(v === '' ? '' : Number(v))}
          decimalScale={1}
          hideControls
        />
      </SimpleGrid>

      <Stack gap="sm">
        {(Object.keys(ION_LABELS) as (keyof WaterIonProfile)[]).map((key) => {
          const [min, max] = WATER_ION_RANGES[key]
          const value = ions[key]
          const pct = Math.min(100, (value / max) * 100)
          return (
            <Stack key={key} gap={4}>
              <Group justify="space-between">
                <Text size="sm" fw={500}>
                  {ION_LABELS[key]}
                </Text>
                <Group gap={6}>
                  <NumberInput
                    value={value}
                    onChange={(v) => setIon(key, v === '' ? '' : Number(v))}
                    hideControls
                    w={80}
                    size="xs"
                  />
                  <Text size="xs" c="dimmed">
                    ppm
                  </Text>
                </Group>
              </Group>
              <Progress value={pct} size="sm" color="amber" />
              <Group justify="space-between">
                <Text size="xs" c="dimmed">
                  {min}
                </Text>
                <Text size="xs" c="dimmed">
                  {max} ppm
                </Text>
              </Group>
            </Stack>
          )
        })}
      </Stack>

      <Group
        justify="space-between"
        p="sm"
        bg="dark.6"
        style={{ borderRadius: 'var(--mantine-radius-md)' }}
      >
        <Text size="sm" c="dimmed">
          {LL.conversions.water.ratioLabel()}{' '}
          <Text component="span" fw={700} c={profile.color}>
            {profile.label}
          </Text>
        </Text>
        <Badge color={profile.color} variant="light">
          {ratio.toFixed(1)}:1
        </Badge>
      </Group>
    </CalcCard>
  )
}
