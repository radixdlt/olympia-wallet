import { app, Menu, MenuItem } from 'electron'

import checkForUpdates from './updater'

const template = [
  {
    label: app.name,
    submenu: [
      {
        label: 'Check for updates...',
        click (menuItem: MenuItem) {
          checkForUpdates(menuItem)
        }
      },
      { type: 'separator' },
      { role: 'hide' },
      { role: 'hideothers' },
      { role: 'unhide' },
      { type: 'separator' },
      { role: 'quit' }
    ]
  }
]

export default process.platform === 'darwin' ? Menu.buildFromTemplate(template) : null
