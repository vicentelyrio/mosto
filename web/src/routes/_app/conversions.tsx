import { createFileRoute } from '@tanstack/react-router'

import { ConversionsPage } from '@features/conversions'

export const Route = createFileRoute('/_app/conversions')({
  component: ConversionsPage,
})
