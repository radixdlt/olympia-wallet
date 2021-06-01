'use strict'

import { app, ipcMain, protocol, BrowserWindow } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer'
import path from 'path'
import contextMenu from 'electron-context-menu'
import { copyToClipboard, getKeystoreFile, storePin, validatePin, writeKeystoreFile, deriveHWAccount  } from '@/actions/electron/create-wallet'
import {
  getAccountName,
  saveAccountName,
  getDerivedAccountsIndex,
  saveDerivedAccountsIndex
} from './actions/electron/data-store'
const isDevelopment = process.env.NODE_ENV !== 'production'
import fs from 'fs'

process.on('uncaughtException', function (err) {
  fs.writeFileSync('crash.log', err + '\n' + err.stack)
})

app.commandLine.appendSwitch('ignore-certificate-errors')
process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } }
])

async function createWindow () {
  // Create the browser window.

  contextMenu({})
  const win = new BrowserWindow({
    width: 1150,
    height: 728,
    maxWidth: 1250,
    maxHeight: 800,
    minWidth: 1150,
    minHeight: 728,
    webPreferences: {

      // Required for Spectron testing
      enableRemoteModule: true,

      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      nodeIntegration: true,
      preload: path.join(__dirname, 'preload.js'),
      devTools: isDevelopment
    }
  })

  win.webContents.on('new-window', function (e, url) {
    e.preventDefault()
    require('electron').shell.openExternal(url)
  })

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL as string)
    if (!process.env.IS_TEST) win.webContents.openDevTools()
  } else {
    createProtocol('app')
    // Load the index.html when not in development
    win.loadURL('app://./index.html')
  }
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installExtension(VUEJS_DEVTOOLS)
    } catch (e) {
      console.error('Vue Devtools failed to install:', e.toString())
    }
  }
  createWindow()
})

// Define channels for ipc to listen to and which actions to fires
ipcMain.handle('save-keystores-message', writeKeystoreFile)
ipcMain.handle('get-keystore-message', getKeystoreFile)
ipcMain.on('copy-to-clipboard', copyToClipboard)
ipcMain.handle('create-pin', storePin)
ipcMain.handle('save-account-name', saveAccountName)
ipcMain.handle('get-account-name', getAccountName)
ipcMain.handle('save-num-accounts', saveDerivedAccountsIndex)
ipcMain.handle('get-num-accounts', getDerivedAccountsIndex)
ipcMain.handle('validate-pin-message', validatePin)
ipcMain.handle('derive-hw-account', deriveHWAccount)

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}
