import { useEffect, useState } from 'react'

import { paths } from '@infrastructure'
import { useNavigate } from '@tanstack/react-router'

import {
  Box,
  Button,
  Center,
  Drawer,
  Group,
  Loader,
  Progress,
  SimpleGrid,
  Slider,
  Stack,
  Tabs,
  Text,
} from '@mantine/core'

import { type Recipe, useRecipe } from '@domain'

import { RecipeActionsMenu } from './recipe-actions-menu'
import classes from './recipe-detail-drawer.module.css'
import drawerClasses from './recipe-drawer.module.css'
import { RecipeDrawerHeader } from './recipe-drawer-header'
import { RecipeFormDrawer } from './recipe-form'

function StatPill({ label, value }: { label: string; value: string | number }) {
  return (
    <Box className={classes.statPill}>
      <Text component="span" c="dimmed" size="xs">
        {label}{' '}
      </Text>
      <Text component="span" fw={700} size="xs">
        {value}
      </Text>
    </Box>
  )
}

function OverviewTab({ recipe }: { recipe: Recipe }) {
  const step = recipe.mash?.steps[0]
  const yeast = recipe.yeasts[0]

  const process = [
    ['Mash Temp', step ? `${step.step_temp}°F` : '—'],
    ['Mash Time', step ? `${step.step_time} min` : '—'],
    ['Boil Time', `${recipe.boil_time} min`],
    ['Yeast', yeast?.form ?? '—'],
    ['Ferm Temp', yeast?.temp_range ?? '—'],
    ['Attenuation', yeast ? `${yeast.attenuation}%` : '—'],
  ] as const

  return (
    <Stack gap="lg">
      <Box>
        <Text size="xs" fw={600} c="dimmed" tt="uppercase" mb="sm">
          Process
        </Text>
        <SimpleGrid cols={2} spacing="xs">
          {process.map(([label, value]) => (
            <Box key={label} className={classes.processCard}>
              <Text size="xs" c="dimmed">
                {label}
              </Text>
              <Text fw={600}>{value}</Text>
            </Box>
          ))}
        </SimpleGrid>
      </Box>

      {yeast && (
        <Box className={classes.processCard}>
          <Text size="xs" c="dimmed">
            Yeast Strain
          </Text>
          <Text fw={600}>{yeast.name}</Text>
        </Box>
      )}
    </Stack>
  )
}

function GrainsTab({ recipe, factor }: { recipe: Recipe; factor: number }) {
  const total = recipe.grains.reduce((sum, g) => sum + g.amount, 0)

  if (recipe.grains.length === 0) {
    return (
      <Text c="dimmed" size="sm">
        No grains recorded.
      </Text>
    )
  }

  return (
    <Stack gap="md">
      <Text size="xs" fw={600} c="dimmed">
        Grain bill — {total.toFixed(1)} lb total
      </Text>
      {recipe.grains.map((g) => (
        <Box key={g.name}>
          <Group justify="space-between" mb="xs">
            <Text size="sm">{g.name}</Text>
            <Text size="sm" c="amber" fw={600}>
              {(g.amount * factor).toFixed(2)} {g.unit}
            </Text>
          </Group>
          <Progress value={g.pct} color="amber" size="sm" />
          <Text size="xs" c="dimmed" mt="xs">
            {g.pct}%
          </Text>
        </Box>
      ))}
    </Stack>
  )
}

function HopsTab({ recipe, factor }: { recipe: Recipe; factor: number }) {
  if (recipe.hops.length === 0) {
    return (
      <Text c="dimmed" size="sm">
        No hops recorded.
      </Text>
    )
  }

  return (
    <Stack gap="xs">
      <Text size="xs" fw={600} c="dimmed" mb="xs">
        Hop schedule
      </Text>
      {recipe.hops.map((h, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: hop names repeat across additions
        <Group key={i} className={classes.hopRow} wrap="nowrap">
          <Box w="2.625rem" ta="center">
            <Text fw={800} c="amber">
              {h.time}
            </Text>
            <Text size="xs" c="dimmed">
              min
            </Text>
          </Box>
          <Box flex={1}>
            <Text size="sm" fw={600}>
              {h.name}
            </Text>
            <Text size="xs" c="dimmed">
              {h.use} · {h.alpha}% AA
            </Text>
          </Box>
          <Text fw={700}>{(h.amount * factor).toFixed(2)} oz</Text>
        </Group>
      ))}
    </Stack>
  )
}

function WaterTab({ recipe, factor }: { recipe: Recipe; factor: number }) {
  if (!recipe.water) {
    return (
      <Text c="dimmed" size="sm">
        No water profile recorded.
      </Text>
    )
  }

  const w = recipe.water
  const minerals = [
    ['Ca²⁺', w.ca],
    ['Mg²⁺', w.mg],
    ['Na⁺', w.na],
    ['SO₄²⁻', w.so4],
    ['Cl⁻', w.cl],
    ['pH', w.ph],
  ] as const

  return (
    <Stack gap="md">
      <Box className={classes.processCard}>
        <Text size="xs" fw={600} c="dimmed" mb="sm">
          Water profile
        </Text>
        <SimpleGrid cols={3} spacing="xs">
          {minerals.map(([label, value]) => (
            <Box key={label} ta="center">
              <Text size="xs" c="dimmed">
                {label}
              </Text>
              <Text fw={700}>{value}</Text>
            </Box>
          ))}
        </SimpleGrid>
      </Box>
      <Group justify="space-between" className={classes.processCard}>
        <Text size="sm" c="dimmed">
          Strike Water
        </Text>
        <Text fw={600}>{(w.volume * factor).toFixed(1)} gal</Text>
      </Group>
    </Stack>
  )
}

function ViewMode({ recipe }: { recipe: Recipe }) {
  const navigate = useNavigate()
  const [tab, setTab] = useState<string | null>('overview')
  const [scale, setScale] = useState(recipe.batch_size)

  useEffect(() => {
    setScale(recipe.batch_size)
  }, [recipe.batch_size])

  const factor = scale / recipe.batch_size

  const close = () => navigate({ to: paths.recipes })

  return (
    <Box className={drawerClasses.wrapper}>
      <RecipeDrawerHeader
        name={recipe.name}
        subtitle={`${recipe.style} · BJCP ${recipe.bjcp_code}`}
        srm={recipe.srm}
        onClose={close}
      />

      <Box className={drawerClasses.body}>
        <Group gap="xs" mb="md">
          <StatPill label="ABV" value={`${recipe.abv}%`} />
          <StatPill label="IBU" value={recipe.ibu} />
          <StatPill label="OG" value={recipe.og.toFixed(3)} />
          <StatPill label="FG" value={recipe.fg.toFixed(3)} />
          <StatPill label="SRM" value={recipe.srm} />
          <StatPill label="EFF" value={`${recipe.efficiency}%`} />
        </Group>

        <Tabs value={tab} onChange={setTab}>
          <Tabs.List>
            <Tabs.Tab value="overview">Overview</Tabs.Tab>
            <Tabs.Tab value="grains">Grains</Tabs.Tab>
            <Tabs.Tab value="hops">Hops</Tabs.Tab>
            <Tabs.Tab value="water">Water</Tabs.Tab>
            <Tabs.Tab value="notes">Notes</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="overview" pt="md">
            <Stack gap="lg">
              <Box className={classes.processCard}>
                <Text size="xs" fw={600} c="dimmed" mb="sm">
                  Scale Batch
                </Text>
                <Group gap="sm" wrap="nowrap">
                  <Slider
                    className={classes.slider}
                    min={1}
                    max={15}
                    step={0.5}
                    value={scale}
                    onChange={setScale}
                    label={null}
                  />
                  <Text fw={700} c="amber" className={classes.scaleValue}>
                    {scale} gal
                  </Text>
                </Group>
                {factor !== 1 && (
                  <Text size="xs" c="dimmed" mt="xs">
                    ×{factor.toFixed(2)} of original recipe
                  </Text>
                )}
              </Box>
              <OverviewTab recipe={recipe} />
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="grains" pt="md">
            <GrainsTab recipe={recipe} factor={factor} />
          </Tabs.Panel>

          <Tabs.Panel value="hops" pt="md">
            <HopsTab recipe={recipe} factor={factor} />
          </Tabs.Panel>

          <Tabs.Panel value="water" pt="md">
            <WaterTab recipe={recipe} factor={factor} />
          </Tabs.Panel>

          <Tabs.Panel value="notes" pt="md">
            <Text size="sm" className={classes.processCard}>
              {recipe.notes || 'No notes recorded.'}
            </Text>
          </Tabs.Panel>
        </Tabs>
      </Box>

      <Group className={drawerClasses.footer} wrap="nowrap">
        <Button flex={1} onClick={() => navigate({ to: paths.brewday })}>
          Start Brew Day →
        </Button>
        <RecipeActionsMenu recipe={recipe} onDeleted={close} />
      </Group>
    </Box>
  )
}

export function RecipeDetailDrawer({
  id,
  editing,
}: {
  id: string
  editing: boolean
}) {
  const navigate = useNavigate()
  const { data: recipe, isLoading } = useRecipe(id)
  const close = () => navigate({ to: paths.recipes })

  if (editing) {
    if (!recipe) return null
    return <RecipeFormDrawer mode="edit" recipe={recipe} />
  }

  return (
    <Drawer
      opened
      onClose={close}
      position="right"
      size="md"
      withCloseButton={false}
      padding={0}
      classNames={{ body: drawerClasses.drawerBody }}
    >
      {isLoading || !recipe ? (
        <Center h="100%">
          <Loader />
        </Center>
      ) : (
        <ViewMode recipe={recipe} />
      )}
    </Drawer>
  )
}
