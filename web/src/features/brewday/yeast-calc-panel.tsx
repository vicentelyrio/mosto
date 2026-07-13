import { useState } from 'react'

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
        Yeast Pitch Calculator
      </Text>

      <SimpleGrid cols={3}>
        <NumberInput
          label="Volume (gal)"
          value={volume}
          onChange={(v) => setVolume(v === '' ? '' : Number(v))}
          step={0.5}
          hideControls
        />
        <NumberInput
          label="OG"
          value={og}
          onChange={(v) => setOg(v === '' ? '' : Number(v))}
          decimalScale={3}
          hideControls
        />
        <Select
          label="Form"
          value={form}
          onChange={(v) => setForm((v as YeastForm) ?? 'liquid')}
          allowDeselect={false}
          data={[
            { value: 'liquid', label: 'Liquid' },
            { value: 'dry', label: 'Dry' },
          ]}
        />
      </SimpleGrid>

      <Group justify="space-between" className={classes.summary}>
        <StatTile label="Cells needed" value={`${needed}B`} accent />
        <StatTile label="Packages" value={`${packages}×`} accent />
        <StatTile label="Per package" value={`${perPackage}B`} />
      </Group>
    </Stack>
  )
}
