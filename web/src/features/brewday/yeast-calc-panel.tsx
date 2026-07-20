import { useState } from 'react'

import { useI18nContext } from '@i18n/i18n-react'

import {
  Box,
  Group,
  NumberInput,
  Select,
  SimpleGrid,
  Stack,
  Text,
} from '@mantine/core'

import type { Recipe } from '@domain'

import {
  cellsNeeded,
  cellsPerPackage,
  packagesNeeded,
  type YeastForm,
} from './yeast-calc'
import classes from './yeast-calc-panel.module.css'

function StatTile({
  label,
  value,
  accent,
}: {
  label: string
  value: string
  accent?: boolean
}) {
  return (
    <Box>
      <Text size="xs" c="dimmed">
        {label}
      </Text>
      <Text fw={800} size="lg" c={accent ? 'amber' : undefined}>
        {value}
      </Text>
    </Box>
  )
}

export function YeastCalcPanel({ recipe }: { recipe: Recipe }) {
  const { LL } = useI18nContext()
  const [volume, setVolume] = useState<number | ''>(recipe.batch_size)
  const [og, setOg] = useState<number | ''>(recipe.og)
  const [form, setForm] = useState<YeastForm>('liquid')

  const vol = volume === '' ? 0 : volume
  const ogVal = og === '' ? 1 : og
  const needed = cellsNeeded(vol, ogVal)
  const packages = packagesNeeded(vol, ogVal, form)
  const perPackage = cellsPerPackage(form)

  return (
    <Stack gap="lg">
      <Text fw={700} size="md">
        {LL.brewday.yeastCalc.title()}
      </Text>

      <SimpleGrid cols={3}>
        <NumberInput
          label={LL.brewday.yeastCalc.volumeLabel()}
          value={volume}
          onChange={(v) => setVolume(v === '' ? '' : Number(v))}
          step={0.5}
          hideControls
        />
        <NumberInput
          label={LL.brewday.yeastCalc.ogLabel()}
          value={og}
          onChange={(v) => setOg(v === '' ? '' : Number(v))}
          decimalScale={3}
          hideControls
        />
        <Select
          label={LL.brewday.yeastCalc.formLabel()}
          value={form}
          onChange={(v) => setForm((v as YeastForm) ?? 'liquid')}
          allowDeselect={false}
          data={[
            { value: 'liquid', label: LL.brewday.yeastCalc.liquid() },
            { value: 'dry', label: LL.brewday.yeastCalc.dry() },
          ]}
        />
      </SimpleGrid>

      <Group justify="space-between" className={classes.summary}>
        <StatTile
          label={LL.brewday.yeastCalc.cellsNeeded()}
          value={`${needed}B`}
          accent
        />
        <StatTile
          label={LL.brewday.yeastCalc.packages()}
          value={`${packages}×`}
          accent
        />
        <StatTile
          label={LL.brewday.yeastCalc.perPackage()}
          value={`${perPackage}B`}
        />
      </Group>
    </Stack>
  )
}
