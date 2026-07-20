import { useI18nContext } from '@i18n/i18n-react'
import { paths } from '@infrastructure'
import { useNavigate } from '@tanstack/react-router'

import { Box, Center, Drawer, Loader, Text } from '@mantine/core'

import { useEquipmentItem } from '@domain'

import drawerClasses from './equipment-drawer.module.css'
import { EquipmentDrawerHeader } from './equipment-drawer-header'
import { EquipmentFormDrawer } from './equipment-form'

export function EquipmentEditDrawer({ id }: { id: string }) {
  const { LL } = useI18nContext()
  const navigate = useNavigate()
  const { data: item, isLoading, isError } = useEquipmentItem(id)
  const close = () => navigate({ to: paths.equipment })

  if (!isLoading && !isError && item) {
    return <EquipmentFormDrawer mode="edit" item={item} onClose={close} />
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
          <EquipmentDrawerHeader
            name={LL.equipment.notFound.name()}
            type={LL.equipment.notFound.type()}
            onClose={close}
          />
          <Box className={drawerClasses.body}>
            <Text c="dimmed" size="sm">
              {LL.equipment.notFound.message()}
            </Text>
          </Box>
        </Box>
      )}
    </Drawer>
  )
}
