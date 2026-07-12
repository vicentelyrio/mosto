import type { ReactNode } from 'react'

import { Box } from '@mantine/core'

import classes from './card-grid.module.css'

export function CardGrid({ children }: { children: ReactNode }) {
  return <Box className={classes.grid}>{children}</Box>
}
