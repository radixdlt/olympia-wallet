'use strict'

import { app, ipcMain, protocol, BrowserWindow, Menu } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer'
import path from 'path'
import contextMenu from 'electron-context-menu'
import { copyToClipboard, getKeystoreFile, storePin, validatePin, writeKeystoreFile } from '@/actions/electron/create-wallet'
import {
  getAccountNames,
  saveAccountName,
  getDerivedAccountsIndex,
  saveDerivedAccountsIndex,
  saveHardwareAddress,
  getHardwareAddress,
  deleteHardwareAddress,
  resetStore,
  persistNodeSelection,
  fetchSelectedNode,
} from './actions/electron/data-store'
import { sendAPDU } from './actions/electron/hardware-wallet'
import menu from './menu'
import electron from 'electron'

const isDevelopment = process.env.NODE_ENV !== 'production'
let win: BrowserWindow

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } }
])

async function createWindow () {
  // Create the browser window.

  contextMenu({})
  win = new BrowserWindow({
    width: 1200,
    height: 650,
    maxWidth: 1300,
    maxHeight: 800,
    minWidth: 1200,
    minHeight: 650,
    webPreferences: {
      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      nodeIntegration: false,
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

  electron.powerMonitor.on('suspend', () => {
    win.webContents.send('resetToHome')
  })

  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installExtension(VUEJS_DEVTOOLS)
    } catch (e) {
      console.error('Vue Devtools failed to install:', e.toString())
    }
  }
  Menu.setApplicationMenu(menu)
  createWindow()
})

// Define channels for ipc to listen to and which actions to fires
ipcMain.handle('save-keystores-message', writeKeystoreFile)
ipcMain.handle('get-keystore-message', getKeystoreFile)
ipcMain.on('copy-to-clipboard', copyToClipboard)
ipcMain.handle('create-pin', storePin)
ipcMain.handle('save-account-name', saveAccountName)
ipcMain.handle('get-account-names', getAccountNames)
ipcMain.handle('save-num-accounts', saveDerivedAccountsIndex)
ipcMain.handle('get-num-accounts', getDerivedAccountsIndex)
ipcMain.handle('validate-pin-message', validatePin)
ipcMain.handle('save-hw-address', saveHardwareAddress)
ipcMain.handle('get-hw-address', getHardwareAddress)
ipcMain.handle('delete-hw-address', deleteHardwareAddress)
ipcMain.handle('send-apdu', sendAPDU)
ipcMain.handle('reset-store', resetStore)
ipcMain.handle('persist-node-selection', persistNodeSelection)
ipcMain.handle('fetch-selected-node', fetchSelectedNode)
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
