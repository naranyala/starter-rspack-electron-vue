// Basic init
const electron = require('electron');
const { app, BrowserWindow } = electron;
const path = require('path');
const url = require('url');
const args = process.argv.slice(1);
const serve = args.some((val) => val === '--start-dev');

// Let electron reloads by itself when rsbuild watches changes in ./app/
// if (serve) {
//   require('electron-reload')(path.join(__dirname, 'dist'));
// }

// To avoid being garbage generated
let mainWindow;

console.log('App starting, serve mode:', serve);

app.on('ready', () => {
  console.log('App ready event fired');
  createWindow();
});

// Log when the app is quitting
app.on('quit', () => {
  console.log('App quit event fired');
});

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});

/**
 * Creates the main browser window
 */
function createWindow() {
  console.log('Creating window...');

  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false,
    },
  });

  console.log('BrowserWindow created');

  // Use dynamic port from environment variable if available, otherwise default
  const devUrl = process.env.ELECTRON_START_URL || 'http://localhost:1234';
  console.log('Loading URL:', devUrl);

  const startUrl = serve
    ? devUrl
    : url.format({
        pathname: path.join(__dirname, 'dist/index.html'),
        protocol: 'file:',
        slashes: true,
      });

  console.log('Final start URL:', startUrl);

  try {
    mainWindow.loadURL(startUrl);
    console.log('URL loaded successfully');
  } catch (error) {
    console.error('Error loading URL:', error);
  }

  // DevTools disabled by default - open manually with Ctrl+Shift+I or F12
  // if (serve) {
  //     console.log('Opening DevTools...');
  //     mainWindow.webContents.openDevTools({ mode: 'detach' })
  // }

  mainWindow.on('closed', () => {
    console.log('Window closed');
    mainWindow = null;
  });

  mainWindow.on('unresponsive', () => {
    console.log('Window became unresponsive');
  });

  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('Failed to load:', errorCode, errorDescription);
  });

  mainWindow.webContents.on('did-finish-load', () => {
    console.log('Page loaded successfully');
  });

  console.log('Window creation completed');
}
