import { createTheme, type MantineColorsTuple, rem } from '@mantine/core'

/* ------------------------------------------------------------------ */
/* Color tuples (index 0 = lightest, 9 = darkest)                     */
/* Lifted from the design project's CSS variables (Mosto.html /       */
/* Mosto Mobile.html): amber accent on a charcoal ground.             */
/* ------------------------------------------------------------------ */

const amber: MantineColorsTuple = [
  '#fdf3e2',
  '#fae4bc',
  '#f7d599',
  '#f7c561', // --amber-light
  '#f4ba48',
  '#f2b23a', // ← brand base (--amber)
  '#e0a02e',
  '#c98c24',
  '#a8721a',
  '#875a12',
]

// Override Mantine's built-in `dark` to match the design's layered surfaces.
// 0 = primary text … 9 = deepest background.
const dark: MantineColorsTuple = [
  '#f2f0ea', // --text
  '#cfccc4',
  '#a6a29a', // --text-2
  '#8b877e',
  '#6b6860', // --text-3
  '#3a3a40', // borders (solid equiv. of --border)
  '#2a2a30', // --surface-3
  '#212126', // --surface-2
  '#1c1c20', // --surface
  '#17171a', // --bg
]

const green: MantineColorsTuple = [
  '#eaf7eb',
  '#d3edd5',
  '#b3e0b6',
  '#8fca92', // --green
  '#6fb873',
  '#57a45b',
  '#458a49',
  '#37703a',
  '#2b592e',
  '#204322',
]

const red: MantineColorsTuple = [
  '#fdece8',
  '#f9d4cb',
  '#f2ab99',
  '#e57862', // --red
  '#d95a41',
  '#c9432a',
  '#a83521',
  '#87291a',
  '#671e13',
  '#48140c',
]

const blue: MantineColorsTuple = [
  '#eaf1fb',
  '#cfe0f5',
  '#a6c6ec',
  '#6f9fd8', // --blue
  '#5487c9',
  '#3f70b5',
  '#325a95',
  '#284674',
  '#1e3455',
  '#152438',
]

export const theme = createTheme({
  primaryColor: 'amber',
  primaryShade: { light: 5, dark: 5 },

  colors: { amber, dark, green, red, blue },

  white: '#f2f0ea',
  black: '#17171a',

  fontFamily:
    "'Hanken Grotesk', system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
  fontFamilyMonospace:
    "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace",
  headings: {
    fontFamily: "'Hanken Grotesk', system-ui, sans-serif",
    fontWeight: '800',
    sizes: {
      h1: { fontSize: rem(28), lineHeight: '1.2', fontWeight: '800' },
      h2: { fontSize: rem(22), lineHeight: '1.25' },
      h3: { fontSize: rem(18), lineHeight: '1.3' },
      h4: { fontSize: rem(15), lineHeight: '1.4' },
    },
  },

  defaultRadius: 'md',
  radius: {
    xs: rem(6),
    sm: rem(8),
    md: rem(10),
    lg: rem(14),
    xl: rem(20),
  },

  components: {
    Button: {
      defaultProps: { radius: 'xl' },
    },
    Paper: {
      defaultProps: { radius: 'lg' },
      styles: {
        root: {
          backgroundColor: 'var(--mantine-color-dark-7)',
          borderColor: 'var(--mantine-color-dark-5)',
        },
      },
    },
    Card: {
      defaultProps: { radius: 'lg', withBorder: true },
      styles: {
        root: {
          backgroundColor: 'var(--mantine-color-dark-7)',
          borderColor: 'var(--mantine-color-dark-5)',
        },
      },
    },
  },
})
