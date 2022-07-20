'use strict'

import electron, { app, ipcMain, protocol, BrowserWindow, webContents } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer'
import path from 'path'
import { debounce } from '@/helpers/debounce'
import contextMenu from 'electron-context-menu'
import { copyToClipboard, getKeystoreFile, storePin, validatePin, writeKeystoreFile } from '@/actions/electron/create-wallet'
import {
  getAccountNames,
  getLatestAccountAddress,
  saveAccountName,
  saveDeviceName,
  getDerivedAccountsIndex,
  saveDerivedAccountsIndex,
  saveDerivedHardwareAccountsIndex,
  saveLatestAccountAddress,
  getAcceptedTos,
  setAcceptedTos,
  getHardwareDevices,
  saveHardwareDevices,
  resetStore,
  persistNodeSelection,
  fetchSelectedNode,
  persistCustomNodeURL,
  fetchCustomNodeURLs,
  forgetCustomNodeURL,
  hideTokenType,
  getHiddenTokens,
  unhideTokenType,
  getHiddenAccounts,
  hideAccount,
  unhideAccount,
  getDecimalType,
  setDecimalType
} from './actions/electron/data-store'
import { getIsUpdateAvailable, getIsUpdateDownloaded } from './actions/electron/general'
import { sendAPDU } from './actions/electron/hardware-wallet'
import { checkForUpdates, downloadUpdate, quitAndInstall } from './updater'

const pkg = require('../package.json')

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
    maximizable: false,
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

const INACTIVITY_INTERVAL = 3600000
const DEBOUNCE_INTERVAL = 1000
// Set interaction detection time period to 1hr. If user does not move mouse or
// interact with keyboard, refresh app and have User log in again.
let idleInterval = setInterval(() => { win.reload()}, INACTIVITY_INTERVAL)

const resetInteractionTimer = () => {
  clearInterval(idleInterval)
  idleInterval = setInterval(() => { win.reload() }, INACTIVITY_INTERVAL)  
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
    if (BrowserWindow.getAllWindows().length > 0) {
      win.reload()
    }
  })

  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installExtension(VUEJS_DEVTOOLS)
    } catch (e) {
      console.error('Vue Devtools failed to install:', e.toString())
    }
  }
  createWindow()

  const onEvent = debounce(resetInteractionTimer, DEBOUNCE_INTERVAL)
  win.webContents.on('before-input-event', onEvent)
  win.webContents.on('cursor-changed', onEvent)
  win.webContents.on('before-input-event', onEvent)

  checkForUpdates()
})

// Define channels for ipc to listen to and which actions to fires
ipcMain.handle('save-keystores-message', writeKeystoreFile)
ipcMain.handle('get-keystore-message', getKeystoreFile)
ipcMain.on('copy-to-clipboard', copyToClipboard)
ipcMain.handle('create-pin', storePin)
ipcMain.handle('save-account-name', saveAccountName)
ipcMain.handle('save-device-name', saveDeviceName)
ipcMain.handle('get-account-names', getAccountNames)
ipcMain.handle('get-latest-account-address', getLatestAccountAddress)
ipcMain.handle('save-latest-account-address', saveLatestAccountAddress)
ipcMain.handle('save-num-accounts', saveDerivedAccountsIndex)
ipcMain.handle('save-hw-num-accounts', saveDerivedHardwareAccountsIndex)
ipcMain.handle('get-num-accounts', getDerivedAccountsIndex)
ipcMain.handle('validate-pin-message', validatePin)
ipcMain.handle('save-hw-devices', saveHardwareDevices)
ipcMain.handle('get-hw-devices', getHardwareDevices)
ipcMain.handle('send-apdu', sendAPDU)
ipcMain.handle('reset-store', resetStore)
ipcMain.handle('persist-node-selection', persistNodeSelection)
ipcMain.handle('fetch-selected-node', fetchSelectedNode)
ipcMain.handle('persist-custom-node-url', persistCustomNodeURL)
ipcMain.handle('fetch-custom-node-urls', fetchCustomNodeURLs)
ipcMain.handle('forget-custom-node-url', forgetCustomNodeURL)
ipcMain.handle('hide-token-type', hideTokenType)
ipcMain.handle('unhide-token-type', unhideTokenType)
ipcMain.handle('get-hidden-tokens', getHiddenTokens)
ipcMain.handle('refresh-app', () => { win.reload() })
ipcMain.handle('get-version-number', () => pkg.version)
ipcMain.handle('download-latest-version', downloadUpdate)
ipcMain.handle('get-is-update-available', getIsUpdateAvailable)
ipcMain.handle('get-is-update-downloaded', getIsUpdateDownloaded)
ipcMain.handle('quit-and-install', quitAndInstall)
ipcMain.handle('get-accepted-tos', getAcceptedTos)
ipcMain.handle('set-accepted-tos', setAcceptedTos)
ipcMain.handle('get-hidden-accounts', getHiddenAccounts)
ipcMain.handle('hide-accounts', hideAccount)
ipcMain.handle('unhide-accounts', unhideAccount)
ipcMain.handle('get-decimal-type', getDecimalType)
ipcMain.handle('set-decimal-type', setDecimalType)

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
