import { store } from '@/actions/electron/data-store'

export const setUpdateIsAvailable = (value: boolean) => store.set('update-available', value)

export const getIsUpdateAvailable = () => store.get('update-available')
