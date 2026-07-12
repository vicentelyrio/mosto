import { NumberInput, Text } from '@mantine/core'

export function CalcField({
  label,
  value,
  onChange,
  unit,
  decimalScale,
  highlight,
}: {
  label: string
  value: number | ''
  onChange?: (value: number | '') => void
  unit?: string
  decimalScale?: number
  highlight?: boolean
}) {
  return (
    <NumberInput
      label={label}
      value={value}
      onChange={(v) => onChange?.(v === '' ? '' : Number(v))}
      readOnly={!onChange}
      variant={onChange ? 'default' : 'filled'}
      decimalScale={decimalScale}
      fixedDecimalScale={decimalScale !== undefined}
      hideControls
      rightSection={
        unit ? (
          <Text size="xs" c="dimmed" pr={4}>
            {unit}
          </Text>
        ) : undefined
      }
      rightSectionWidth={unit ? unit.length * 7 + 16 : undefined}
      styles={
        highlight
          ? {
              input: {
                borderColor: 'var(--mantine-color-amber-5)',
                color: 'var(--mantine-color-amber-5)',
                fontWeight: 700,
              },
            }
          : undefined
      }
    />
  )
}
