import { useState } from 'react'

import {
  Alert,
  Box,
  Button,
  Drawer,
  Group,
  Select,
  SimpleGrid,
  Stack,
  Textarea,
  TextInput,
} from '@mantine/core'
import { useForm } from '@mantine/form'

import {
  ApiError,
  type Condition,
  type Equipment,
  type EquipmentInput,
  useEquipment,
} from '@domain'

import drawerClasses from './equipment-drawer.module.css'
import { EquipmentDrawerHeader } from './equipment-drawer-header'
import { TYPES } from './equipment-meta'

interface FormValues {
  name: string
  type: string
  capacity: string
  material: string
  condition: Condition
  notes: string
}

const EMPTY_VALUES: FormValues = {
  name: '',
  type: TYPES[0],
  capacity: '',
  material: '',
  condition: 'good',
  notes: '',
}

function valuesFromItem(item: Equipment): FormValues {
  return {
    name: item.name,
    type: item.type,
    capacity: item.capacity,
    material: item.material,
    condition: item.condition,
    notes: item.notes,
  }
}

function toEquipmentInput(values: FormValues): EquipmentInput {
  return {
    name: values.name.trim(),
    type: values.type,
    capacity: values.capacity.trim(),
    material: values.material.trim(),
    condition: values.condition,
    notes: values.notes.trim(),
  }
}

type EquipmentFormDrawerProps =
  | { mode: 'create'; onClose: () => void }
  | { mode: 'edit'; item: Equipment; onClose: () => void }

export function EquipmentFormDrawer(props: EquipmentFormDrawerProps) {
  const { create, update } = useEquipment()
  const [submitError, setSubmitError] = useState<string | null>(null)

  const form = useForm<FormValues>({
    initialValues:
      props.mode === 'edit' ? valuesFromItem(props.item) : EMPTY_VALUES,
    validate: {
      name: (v) => (v.trim() ? null : 'Required'),
    },
  })

  const onError = (err: unknown) =>
    setSubmitError(
      err instanceof ApiError ? err.message : 'Could not save this equipment',
    )

  const submit = form.onSubmit((values) => {
    setSubmitError(null)
    const input = toEquipmentInput(values)
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
        <EquipmentDrawerHeader
          name={form.values.name || 'New Equipment'}
          type={form.values.type}
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

              <TextInput
                label="Name"
                required
                {...form.getInputProps('name')}
              />

              <SimpleGrid cols={2}>
                <Select
                  label="Type"
                  data={[...TYPES]}
                  allowDeselect={false}
                  {...form.getInputProps('type')}
                />
                <Select
                  label="Condition"
                  data={[
                    { value: 'good', label: 'Good' },
                    { value: 'fair', label: 'Fair' },
                    { value: 'poor', label: 'Poor' },
                  ]}
                  allowDeselect={false}
                  {...form.getInputProps('condition')}
                />
              </SimpleGrid>

              <SimpleGrid cols={2}>
                <TextInput
                  label="Capacity"
                  placeholder="e.g. 10 gal"
                  {...form.getInputProps('capacity')}
                />
                <TextInput
                  label="Material"
                  placeholder="e.g. Stainless Steel"
                  {...form.getInputProps('material')}
                />
              </SimpleGrid>

              <Textarea
                label="Notes"
                minRows={3}
                {...form.getInputProps('notes')}
              />
            </Stack>
          </Box>

          <Group className={drawerClasses.footer} justify="flex-end">
            <Button variant="subtle" onClick={props.onClose} type="button">
              Cancel
            </Button>
            <Button type="submit" loading={pending}>
              {props.mode === 'edit' ? 'Save changes' : 'Add equipment'}
            </Button>
          </Group>
        </form>
      </Box>
    </Drawer>
  )
}
