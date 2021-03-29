import { IpcMainEvent } from 'electron/main'
import fs from 'fs'
import { readFile } from 'fs/promises'

export const writeKeystoreFile = (event: IpcMainEvent, encodedWallet: string) => {
  fs.writeFile('./keystore.json', encodedWallet, (err) => {
    if (err as Error) throw err
    console.log('The file has been saved!')
  })
}

export const getKeystoreFile = () =>
  readFile('./keystore.json', 'utf-8')
