import { useState } from 'react'

import {
  Alert,
  Box,
  Button,
  Drawer,
  Group,
  NumberInput,
  Select,
  SimpleGrid,
  Stack,
  TextInput,
} from '@mantine/core'
import { useForm } from '@mantine/form'

import {
  ApiError,
  type InventoryCategory,
  type InventoryItem,
  type InventoryItemInput,
  useInventory,
} from '@domain'

import drawerClasses from './inventory-drawer.module.css'
import { InventoryDrawerHeader } from './inventory-drawer-header'
import {
  CATEGORIES,
  CATEGORY_COLORS,
  CATEGORY_LABELS,
  UNITS,
} from './inventory-meta'

interface FormValues {
  category: InventoryCategory
  name: string
  amount: number | ''
  unit: string
  low_threshold: number | ''
  expiry: string
  brand: string
  alpha: number | ''
  form: string
  attenuation: string
}

function emptyValues(category: InventoryCategory): FormValues {
  return {
    category,
    name: '',
    amount: '',
    unit: 'lb',
    low_threshold: '',
    expiry: '',
    brand: '',
    alpha: '',
    form: category === 'hop' ? 'pellet' : category === 'yeast' ? 'liquid' : '',
    attenuation: '',
  }
}

function valuesFromItem(item: InventoryItem): FormValues {
  return {
    category: item.category,
    name: item.name,
    amount: item.amount,
    unit: item.unit,
    low_threshold: item.low_threshold ?? '',
    expiry: item.expiry ?? '',
    brand: item.brand ?? '',
    alpha: item.alpha ?? '',
    form: item.form ?? '',
    attenuation: item.attenuation ?? '',
  }
}

function toItemInput(values: FormValues): InventoryItemInput {
  const isHop = values.category === 'hop'
  const isYeast = values.category === 'yeast'
  return {
    category: values.category,
    name: values.name.trim(),
    amount: values.amount === '' ? 0 : values.amount,
    unit: values.unit,
    low_threshold: values.low_threshold === '' ? null : values.low_threshold,
    expiry: values.expiry || null,
    brand: !isHop && !isYeast && values.brand ? values.brand : null,
    alpha: isHop && values.alpha !== '' ? values.alpha : null,
    form: isHop || isYeast ? values.form || null : null,
    attenuation: isYeast && values.attenuation ? values.attenuation : null,
  }
}

type InventoryItemFormDrawerProps =
  | { mode: 'create'; category: InventoryCategory; onClose: () => void }
  | { mode: 'edit'; item: InventoryItem; onClose: () => void }

export function InventoryItemFormDrawer(props: InventoryItemFormDrawerProps) {
  const { create, update } = useInventory()
  const [submitError, setSubmitError] = useState<string | null>(null)

  const form = useForm<FormValues>({
    initialValues:
      props.mode === 'edit'
        ? valuesFromItem(props.item)
        : emptyValues(props.category),
    validate: {
      name: (v) => (v.trim() ? null : 'Required'),
      amount: (v) => (v === '' ? 'Required' : null),
      unit: (v) => (v.trim() ? null : 'Required'),
    },
  })

  const isHop = form.values.category === 'hop'
  const isYeast = form.values.category === 'yeast'

  const onError = (err: unknown) =>
    setSubmitError(
      err instanceof ApiError ? err.message : 'Could not save this item',
    )

  const submit = form.onSubmit((values) => {
    setSubmitError(null)
    const input = toItemInput(values)
    if (props.mode === 'edit') {
      update.mutate(
        { id: props.item.id, input },
        { onSuccess: props.onClose, onError },
      )
    } else {
      create.mutate(input, { onSuccess: props.onClose, onError })
    }
  })

  const pending = props.mode === 'edit' ? update.isPending : create.isPending

  return (
    <Drawer
      opened
      onClose={props.onClose}
      position="right"
      size="md"
      withCloseButton={false}
      padding={0}
      classNames={{ body: drawerClasses.drawerBody }}
    >
      <Box className={drawerClasses.wrapper}>
        <InventoryDrawerHeader
          name={form.values.name || 'New Item'}
          subtitle={CATEGORY_LABELS[form.values.category]}
          color={CATEGORY_COLORS[form.values.category]}
          onClose={props.onClose}
        />

        <form onSubmit={submit} className={drawerClasses.form}>
          <Box className={drawerClasses.body}>
            <Stack gap="md">
              {submitError && (
                <Alert color="red" title="Couldn't save">
                  {submitError}
                </Alert>
              )}

              <Select
                label="Category"
                data={CATEGORIES.map((c) => ({ value: c.key, label: c.label }))}
                allowDeselect={false}
                {...form.getInputProps('category')}
              />

              <TextInput
                label="Name"
                placeholder={`e.g. ${CATEGORY_LABELS[form.values.category]}`}
                required
                {...form.getInputProps('name')}
              />

              <SimpleGrid cols={2}>
                <NumberInput
                  label="Amount"
                  min={0}
                  required
                  {...form.getInputProps('amount')}
                />
                <Select
                  label="Unit"
                  data={UNITS as unknown as string[]}
                  allowDeselect={false}
                  {...form.getInputProps('unit')}
                />
              </SimpleGrid>

              <SimpleGrid cols={2}>
                <NumberInput
                  label="Low stock threshold"
                  description="Optional"
                  min={0}
                  {...form.getInputProps('low_threshold')}
                />
                <TextInput
                  type="date"
                  label="Expiry"
                  description="Optional"
                  {...form.getInputProps('expiry')}
                />
              </SimpleGrid>

              {isHop && (
                <SimpleGrid cols={2}>
                  <NumberInput
                    label="Alpha acid %"
                    step={0.1}
                    min={0}
                    {...form.getInputProps('alpha')}
                  />
                  <Select
                    label="Form"
                    data={['pellet', 'whole']}
                    allowDeselect={false}
                    {...form.getInputProps('form')}
                  />
                </SimpleGrid>
              )}

              {isYeast && (
                <SimpleGrid cols={2}>
                  <Select
                    label="Form"
                    data={['liquid', 'dry', 'slant', 'culture']}
                    allowDeselect={false}
                    {...form.getInputProps('form')}
                  />
                  <TextInput
                    label="Attenuation"
                    placeholder="e.g. 73-77%"
                    {...form.getInputProps('attenuation')}
                  />
                </SimpleGrid>
              )}

              {!isHop && !isYeast && (
                <TextInput
                  label="Brand"
                  description="Optional"
                  {...form.getInputProps('brand')}
                />
              )}
            </Stack>
          </Box>

          <Group className={drawerClasses.footer} justify="flex-end">
            <Button variant="subtle" onClick={props.onClose} type="button">
              Cancel
            </Button>
            <Button type="submit" loading={pending}>
              {props.mode === 'edit' ? 'Save changes' : 'Add item'}
            </Button>
          </Group>
        </form>
      </Box>
    </Drawer>
  )
}
