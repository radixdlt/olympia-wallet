import { store } from '@/actions/electron/data-store'

export const setUpdateIsAvailable = (value: boolean): void => store.set('update-available', value)

export const getIsUpdateAvailable = (): boolean | unknown => store.get('update-available', false)
