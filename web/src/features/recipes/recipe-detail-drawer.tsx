import { useEffect, useState } from 'react'

import { useI18nContext } from '@i18n/i18n-react'
import type { TranslationFunctions } from '@i18n/i18n-types'
import { paths } from '@infrastructure'
import { useNavigate } from '@tanstack/react-router'

import {
  Badge,
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
import { useRecipeActions } from './use-recipe-actions'

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

function OverviewTab({
  LL,
  recipe,
}: {
  LL: TranslationFunctions
  recipe: Recipe
}) {
  const step = recipe.mash?.steps[0]
  const yeast = recipe.yeasts[0]

  const process = [
    [LL.recipes.detail.mashTemp(), step ? `${step.step_temp}°F` : '—'],
    [LL.recipes.detail.mashTime(), step ? `${step.step_time} min` : '—'],
    [LL.recipes.detail.boilTime(), `${recipe.boil_time} min`],
    [LL.recipes.detail.yeast(), yeast?.form ?? '—'],
    [LL.recipes.detail.fermTemp(), yeast?.temp_range ?? '—'],
    [LL.recipes.detail.attenuation(), yeast ? `${yeast.attenuation}%` : '—'],
  ] as const

  return (
    <Stack gap="lg">
      <Box>
        <Text size="xs" fw={600} c="dimmed" tt="uppercase" mb="sm">
          {LL.recipes.detail.process()}
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
            {LL.recipes.detail.yeastStrain()}
          </Text>
          <Text fw={600}>{yeast.name}</Text>
        </Box>
      )}
    </Stack>
  )
}

function GrainsTab({
  LL,
  recipe,
  factor,
}: {
  LL: TranslationFunctions
  recipe: Recipe
  factor: number
}) {
  const total = recipe.grains.reduce((sum, g) => sum + g.amount, 0)

  if (recipe.grains.length === 0) {
    return (
      <Text c="dimmed" size="sm">
        {LL.recipes.detail.noGrains()}
      </Text>
    )
  }

  return (
    <Stack gap="md">
      <Text size="xs" fw={600} c="dimmed">
        {LL.recipes.detail.grainBill({ total: total.toFixed(1) })}
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

function HopsTab({
  LL,
  recipe,
  factor,
}: {
  LL: TranslationFunctions
  recipe: Recipe
  factor: number
}) {
  if (recipe.hops.length === 0) {
    return (
      <Text c="dimmed" size="sm">
        {LL.recipes.detail.noHops()}
      </Text>
    )
  }

  return (
    <Stack gap="xs">
      <Text size="xs" fw={600} c="dimmed" mb="xs">
        {LL.recipes.detail.hopSchedule()}
      </Text>
      {recipe.hops.map((h, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: hop names repeat across additions
        <Group key={i} className={classes.hopRow} wrap="nowrap">
          <Box w="2.625rem" ta="center">
            <Text fw={800} c="amber">
              {h.time}
            </Text>
            <Text size="xs" c="dimmed">
              {LL.recipes.detail.min()}
            </Text>
          </Box>
          <Box flex={1}>
            <Text size="sm" fw={600}>
              {h.name}
            </Text>
            <Text size="xs" c="dimmed">
              {LL.recipes.detail.hopUseAlpha({ use: h.use, alpha: h.alpha })}
            </Text>
          </Box>
          <Text fw={700}>{(h.amount * factor).toFixed(2)} oz</Text>
        </Group>
      ))}
    </Stack>
  )
}

function WaterTab({
  LL,
  recipe,
  factor,
}: {
  LL: TranslationFunctions
  recipe: Recipe
  factor: number
}) {
  if (!recipe.water) {
    return (
      <Text c="dimmed" size="sm">
        {LL.recipes.detail.noWater()}
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
          {LL.recipes.detail.waterProfile()}
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
          {LL.recipes.detail.strikeWater()}
        </Text>
        <Text fw={600}>{(w.volume * factor).toFixed(1)} gal</Text>
      </Group>
    </Stack>
  )
}

function ViewMode({ recipe }: { recipe: Recipe }) {
  const { LL } = useI18nContext()
  const navigate = useNavigate()
  const [tab, setTab] = useState<string | null>('overview')
  const [scale, setScale] = useState(recipe.batch_size)
  const { startBrewing, isBrewing } = useRecipeActions(recipe)

  useEffect(() => {
    setScale(recipe.batch_size)
  }, [recipe.batch_size])

  const factor = scale / recipe.batch_size

  const close = () => navigate({ to: paths.recipes })

  return (
    <Box className={drawerClasses.wrapper}>
      <RecipeDrawerHeader
        name={recipe.name}
        subtitle={LL.recipes.styleBjcp({
          style: recipe.style,
          code: recipe.bjcp_code,
        })}
        srm={recipe.srm}
        badge={
          isBrewing && (
            <Badge color="amber" variant="light">
              {LL.recipes.brewingBadge()}
            </Badge>
          )
        }
        onClose={close}
      />

      <Box className={drawerClasses.body}>
        <Group gap="xs" mb="md">
          <StatPill label={LL.recipes.stats.abv()} value={`${recipe.abv}%`} />
          <StatPill label={LL.recipes.stats.ibu()} value={recipe.ibu} />
          <StatPill
            label={LL.recipes.stats.og()}
            value={recipe.og.toFixed(3)}
          />
          <StatPill
            label={LL.recipes.stats.fg()}
            value={recipe.fg.toFixed(3)}
          />
          <StatPill label={LL.recipes.stats.srm()} value={recipe.srm} />
          <StatPill
            label={LL.recipes.stats.eff()}
            value={`${recipe.efficiency}%`}
          />
        </Group>

        <Tabs value={tab} onChange={setTab}>
          <Tabs.List>
            <Tabs.Tab value="overview">
              {LL.recipes.detail.tabs.overview()}
            </Tabs.Tab>
            <Tabs.Tab value="grains">
              {LL.recipes.detail.tabs.grains()}
            </Tabs.Tab>
            <Tabs.Tab value="hops">{LL.recipes.detail.tabs.hops()}</Tabs.Tab>
            <Tabs.Tab value="water">{LL.recipes.detail.tabs.water()}</Tabs.Tab>
            <Tabs.Tab value="notes">{LL.recipes.detail.tabs.notes()}</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="overview" pt="md">
            <Stack gap="lg">
              <Box className={classes.processCard}>
                <Text size="xs" fw={600} c="dimmed" mb="sm">
                  {LL.recipes.detail.scaleBatch()}
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
                    {LL.recipes.batchSize({ size: scale })}
                  </Text>
                </Group>
                {factor !== 1 && (
                  <Text size="xs" c="dimmed" mt="xs">
                    {LL.recipes.detail.scaleFactor({
                      factor: factor.toFixed(2),
                    })}
                  </Text>
                )}
              </Box>
              <OverviewTab LL={LL} recipe={recipe} />
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="grains" pt="md">
            <GrainsTab LL={LL} recipe={recipe} factor={factor} />
          </Tabs.Panel>

          <Tabs.Panel value="hops" pt="md">
            <HopsTab LL={LL} recipe={recipe} factor={factor} />
          </Tabs.Panel>

          <Tabs.Panel value="water" pt="md">
            <WaterTab LL={LL} recipe={recipe} factor={factor} />
          </Tabs.Panel>

          <Tabs.Panel value="notes" pt="md">
            <Text size="sm" className={classes.processCard}>
              {recipe.notes || LL.recipes.detail.noNotes()}
            </Text>
          </Tabs.Panel>
        </Tabs>
      </Box>

      <Group className={drawerClasses.footer} wrap="nowrap">
        <Button flex={1} onClick={startBrewing}>
          {isBrewing
            ? LL.recipes.actions.resumeBrewing()
            : LL.recipes.actions.startBrewing()}{' '}
          →
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
  const { LL } = useI18nContext()
  const navigate = useNavigate()
  const { data: recipe, isLoading, isError } = useRecipe(id)
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
      {isLoading ? (
        <Center h="100%">
          <Loader />
        </Center>
      ) : isError || !recipe ? (
        <Box className={drawerClasses.wrapper}>
          <RecipeDrawerHeader
            name={LL.recipes.notFound.name()}
            subtitle={LL.recipes.notFound.subtitle()}
            srm={0}
            onClose={close}
          />
          <Box className={drawerClasses.body}>
            <Text c="dimmed" size="sm">
              {LL.recipes.notFound.message()}
            </Text>
          </Box>
        </Box>
      ) : (
        <ViewMode recipe={recipe} />
      )}
    </Drawer>
  )
}
