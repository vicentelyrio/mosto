import { paths } from '@infrastructure'
import { useNavigate } from '@tanstack/react-router'

import {
  Box,
  Button,
  Drawer,
  Group,
  NumberInput,
  SimpleGrid,
  Stack,
  Textarea,
  TextInput,
} from '@mantine/core'
import { useForm } from '@mantine/form'

import type { Recipe, RecipeInput } from '@domain'
import { useRecipes } from '@domain'

import drawerClasses from './recipe-drawer.module.css'
import { RecipeDrawerHeader } from './recipe-drawer-header'

interface RecipeFormValues {
  name: string
  style: string
  bjcp_code: string
  batch_size: number
  og: number
  fg: number
  abv: number
  ibu: number
  srm: number
  efficiency: number
  boil_time: number
  tags: string
  notes: string
}

const EMPTY_VALUES: RecipeFormValues = {
  name: '',
  style: '',
  bjcp_code: '',
  batch_size: 5,
  og: 1.05,
  fg: 1.01,
  abv: 0,
  ibu: 0,
  srm: 0,
  efficiency: 75,
  boil_time: 60,
  tags: '',
  notes: '',
}

function valuesFromRecipe(recipe: Recipe): RecipeFormValues {
  return {
    name: recipe.name,
    style: recipe.style,
    bjcp_code: recipe.bjcp_code,
    batch_size: recipe.batch_size,
    og: recipe.og,
    fg: recipe.fg,
    abv: recipe.abv,
    ibu: recipe.ibu,
    srm: recipe.srm,
    efficiency: recipe.efficiency,
    boil_time: recipe.boil_time,
    tags: recipe.tags.join(', '),
    notes: recipe.notes,
  }
}

/** Merges edited scalar fields into a full `RecipeInput` — grains/hops/yeasts/
 *  water/mash/style_guide aren't editable here yet (no design for that), so
 *  they pass through unchanged (or empty, on create). */
function toRecipeInput(values: RecipeFormValues, base?: Recipe): RecipeInput {
  return {
    name: values.name,
    style: values.style,
    bjcp_code: values.bjcp_code,
    batch_size: values.batch_size,
    og: values.og,
    fg: values.fg,
    abv: values.abv,
    ibu: values.ibu,
    srm: values.srm,
    efficiency: values.efficiency,
    boil_time: values.boil_time,
    tags: values.tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean),
    notes: values.notes,
    last_brewed: base?.last_brewed ?? null,
    grains: base?.grains ?? [],
    hops: base?.hops ?? [],
    yeasts: base?.yeasts ?? [],
    water: base?.water ?? null,
    mash: base?.mash ?? null,
    style_guide: base?.style_guide ?? null,
  }
}

type RecipeFormDrawerProps =
  | { mode: 'create' }
  | { mode: 'edit'; recipe: Recipe }

export function RecipeFormDrawer(props: RecipeFormDrawerProps) {
  const navigate = useNavigate()
  const { create, update } = useRecipes()

  const form = useForm<RecipeFormValues>({
    initialValues:
      props.mode === 'edit' ? valuesFromRecipe(props.recipe) : EMPTY_VALUES,
    validate: {
      name: (v) => (v.trim() ? null : 'Required'),
      style: (v) => (v.trim() ? null : 'Required'),
    },
  })

  const close = () => {
    if (props.mode === 'edit') {
      navigate({ to: paths.recipeDetail, params: { id: props.recipe.id } })
    } else {
      navigate({ to: paths.recipes })
    }
  }

  const submit = form.onSubmit((values) => {
    if (props.mode === 'edit') {
      update.mutate(
        { id: props.recipe.id, input: toRecipeInput(values, props.recipe) },
        {
          onSuccess: () =>
            navigate({
              to: paths.recipeDetail,
              params: { id: props.recipe.id },
            }),
        },
      )
    } else {
      create.mutate(toRecipeInput(values), {
        onSuccess: (recipe) =>
          navigate({ to: paths.recipeDetail, params: { id: recipe.id } }),
      })
    }
  })

  const pending = props.mode === 'edit' ? update.isPending : create.isPending

  const subtitle =
    [
      form.values.style,
      form.values.bjcp_code && `BJCP ${form.values.bjcp_code}`,
    ]
      .filter(Boolean)
      .join(' · ') || 'Style · BJCP code'

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
      <Box className={drawerClasses.wrapper}>
        <RecipeDrawerHeader
          name={form.values.name || 'New Recipe'}
          subtitle={subtitle}
          srm={form.values.srm}
          onClose={close}
        />

        <form onSubmit={submit} className={drawerClasses.form}>
          <Box className={drawerClasses.body}>
            <Stack gap="md">
              <TextInput
                label="Name"
                required
                {...form.getInputProps('name')}
              />
              <Group grow>
                <TextInput
                  label="Style"
                  required
                  {...form.getInputProps('style')}
                />
                <TextInput
                  label="BJCP code"
                  {...form.getInputProps('bjcp_code')}
                />
              </Group>

              <SimpleGrid cols={2}>
                <NumberInput
                  label="Batch size (gal)"
                  min={0}
                  step={0.5}
                  {...form.getInputProps('batch_size')}
                />
                <NumberInput
                  label="Boil time (min)"
                  min={0}
                  {...form.getInputProps('boil_time')}
                />
                <NumberInput
                  label="OG"
                  min={0}
                  step={0.001}
                  decimalScale={3}
                  fixedDecimalScale
                  {...form.getInputProps('og')}
                />
                <NumberInput
                  label="FG"
                  min={0}
                  step={0.001}
                  decimalScale={3}
                  fixedDecimalScale
                  {...form.getInputProps('fg')}
                />
                <NumberInput
                  label="ABV %"
                  min={0}
                  step={0.1}
                  {...form.getInputProps('abv')}
                />
                <NumberInput
                  label="IBU"
                  min={0}
                  {...form.getInputProps('ibu')}
                />
                <NumberInput
                  label="SRM"
                  min={0}
                  {...form.getInputProps('srm')}
                />
                <NumberInput
                  label="Efficiency %"
                  min={0}
                  max={100}
                  {...form.getInputProps('efficiency')}
                />
              </SimpleGrid>

              <TextInput
                label="Tags"
                description="Comma-separated"
                {...form.getInputProps('tags')}
              />

              <Textarea
                label="Notes"
                minRows={3}
                {...form.getInputProps('notes')}
              />
            </Stack>
          </Box>

          <Group className={drawerClasses.footer} justify="flex-end">
            <Button variant="subtle" onClick={close} type="button">
              Cancel
            </Button>
            <Button type="submit" loading={pending}>
              {props.mode === 'edit' ? 'Save changes' : 'Create recipe'}
            </Button>
          </Group>
        </form>
      </Box>
    </Drawer>
  )
}
