import { useState } from 'react'

import { useI18nContext } from '@i18n/i18n-react'

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
import { CATEGORY_COLORS, CATEGORY_KEYS, UNITS } from './inventory-meta'

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
  const { LL } = useI18nContext()
  const { create, update } = useInventory()
  const [submitError, setSubmitError] = useState<string | null>(null)

  const form = useForm<FormValues>({
    initialValues:
      props.mode === 'edit'
        ? valuesFromItem(props.item)
        : emptyValues(props.category),
    validate: {
      name: (v) => (v.trim() ? null : LL.common.required()),
      amount: (v) => (v === '' ? LL.common.required() : null),
      unit: (v) => (v.trim() ? null : LL.common.required()),
    },
  })

  const isHop = form.values.category === 'hop'
  const isYeast = form.values.category === 'yeast'

  const onError = (err: unknown) =>
    setSubmitError(
      err instanceof ApiError ? err.message : LL.inventory.saveError.generic(),
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
          name={form.values.name || LL.inventory.newItem()}
          subtitle={LL.inventory.category[form.values.category]()}
          color={CATEGORY_COLORS[form.values.category]}
          onClose={props.onClose}
        />

        <form onSubmit={submit} className={drawerClasses.form}>
          <Box className={drawerClasses.body}>
            <Stack gap="md">
              {submitError && (
                <Alert color="red" title={LL.inventory.saveError.title()}>
                  {submitError}
                </Alert>
              )}

              <Select
                label={LL.inventory.form.categoryLabel()}
                data={CATEGORY_KEYS.map((key) => ({
                  value: key,
                  label: LL.inventory.category[key](),
                }))}
                allowDeselect={false}
                {...form.getInputProps('category')}
              />

              <TextInput
                label={LL.inventory.form.nameLabel()}
                placeholder={LL.inventory.form.namePlaceholder({
                  category: LL.inventory.category[form.values.category](),
                })}
                required
                {...form.getInputProps('name')}
              />

              <SimpleGrid cols={2}>
                <NumberInput
                  label={LL.inventory.form.amountLabel()}
                  min={0}
                  required
                  {...form.getInputProps('amount')}
                />
                <Select
                  label={LL.inventory.form.unitLabel()}
                  data={UNITS as unknown as string[]}
                  allowDeselect={false}
                  {...form.getInputProps('unit')}
                />
              </SimpleGrid>

              <SimpleGrid cols={2}>
                <NumberInput
                  label={LL.inventory.form.lowThresholdLabel()}
                  description={LL.inventory.form.optional()}
                  min={0}
                  {...form.getInputProps('low_threshold')}
                />
                <TextInput
                  type="date"
                  label={LL.inventory.form.expiryLabel()}
                  description={LL.inventory.form.optional()}
                  {...form.getInputProps('expiry')}
                />
              </SimpleGrid>

              {isHop && (
                <SimpleGrid cols={2}>
                  <NumberInput
                    label={LL.inventory.form.alphaLabel()}
                    step={0.1}
                    min={0}
                    {...form.getInputProps('alpha')}
                  />
                  <Select
                    label={LL.inventory.form.formLabel()}
                    data={['pellet', 'whole']}
                    allowDeselect={false}
                    {...form.getInputProps('form')}
                  />
                </SimpleGrid>
              )}

              {isYeast && (
                <SimpleGrid cols={2}>
                  <Select
                    label={LL.inventory.form.formLabel()}
                    data={['liquid', 'dry', 'slant', 'culture']}
                    allowDeselect={false}
                    {...form.getInputProps('form')}
                  />
                  <TextInput
                    label={LL.inventory.form.attenuationLabel()}
                    placeholder={LL.inventory.form.attenuationPlaceholder()}
                    {...form.getInputProps('attenuation')}
                  />
                </SimpleGrid>
              )}

              {!isHop && !isYeast && (
                <TextInput
                  label={LL.inventory.form.brandLabel()}
                  description={LL.inventory.form.optional()}
                  {...form.getInputProps('brand')}
                />
              )}
            </Stack>
          </Box>

          <Group className={drawerClasses.footer} justify="flex-end">
            <Button variant="subtle" onClick={props.onClose} type="button">
              {LL.common.cancel()}
            </Button>
            <Button type="submit" loading={pending}>
              {props.mode === 'edit'
                ? LL.inventory.form.saveChanges()
                : LL.inventory.form.addItem()}
            </Button>
          </Group>
        </form>
      </Box>
    </Drawer>
  )
}
