import { useI18nContext } from '@i18n/i18n-react'
import { paths } from '@infrastructure'
import { useNavigate } from '@tanstack/react-router'

import { Box, Center, Drawer, Loader, Text } from '@mantine/core'

import { useInventoryItem } from '@domain'

import drawerClasses from './inventory-drawer.module.css'
import { InventoryDrawerHeader } from './inventory-drawer-header'
import { InventoryItemFormDrawer } from './inventory-item-form'

export function InventoryItemEditDrawer({ id }: { id: string }) {
  const { LL } = useI18nContext()
  const navigate = useNavigate()
  const { data: item, isLoading, isError } = useInventoryItem(id)
  const close = () => navigate({ to: paths.inventory })

  if (!isLoading && !isError && item) {
    return <InventoryItemFormDrawer mode="edit" item={item} onClose={close} />
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
      ) : (
        <Box className={drawerClasses.wrapper}>
          <InventoryDrawerHeader
            name={LL.inventory.itemNotFound.name()}
            subtitle={LL.inventory.itemNotFound.subtitle()}
            color="gray"
            onClose={close}
          />
          <Box className={drawerClasses.body}>
            <Text c="dimmed" size="sm">
              {LL.inventory.itemNotFound.message()}
            </Text>
          </Box>
        </Box>
      )}
    </Drawer>
  )
}
