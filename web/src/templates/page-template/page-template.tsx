import type { ReactNode } from 'react'

import { Container, Group, Stack, Text, Title } from '@mantine/core'

interface PageTemplateProps {
  title: string
  subtitle?: string
  actions?: ReactNode
  children: ReactNode
}

export function PageTemplate({
  title,
  subtitle,
  actions,
  children,
}: PageTemplateProps) {
  return (
    <Container size="lg" px={{ base: 'md', sm: 'xl' }} py="xl">
      <Group justify="space-between" align="flex-start" wrap="wrap" mb="xl">
        <Stack gap="xs">
          <Title order={1}>{title}</Title>
          {subtitle && <Text c="dimmed">{subtitle}</Text>}
        </Stack>
        {actions}
      </Group>
      {children}
    </Container>
  )
}
