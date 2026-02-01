import {
  app,
  BrowserWindow,
  dialog,
  type IpcMainInvokeEvent,
  ipcMain,
  type MessageBoxOptions,
  type WebContents,
} from 'electron';

export class WindowManager {
  private windows: Map<number, BrowserWindow>;
  private preloadPath: string;
  private iconPath: string;
  private hiddenWindows: Set<number> = new Set();

  constructor(preloadPath: string = '', iconPath: string = '') {
    this.windows = new Map();
    this.preloadPath = preloadPath;
    this.iconPath = iconPath;
  }

  createWindow(options: Electron.BrowserWindowConstructorOptions = {}): BrowserWindow {
    const defaultOptions: Electron.BrowserWindowConstructorOptions = {
      width: 1024,
      height: 768,
      minWidth: 800,
      minHeight: 600,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        webSecurity: false,
        preload: this.preloadPath,
      },
      icon: this.iconPath,
      show: false,
    };

    const window = new BrowserWindow({ ...defaultOptions, ...options });
    const windowId = window.id;
    this.windows.set(windowId, window);

    window.on('closed', () => {
      this.windows.delete(windowId);
      this.hiddenWindows.delete(windowId);
    });

    window.on('hide', () => {
      this.hiddenWindows.add(windowId);
    });

    window.on('show', () => {
      this.hiddenWindows.delete(windowId);
    });

    return window;
  }

  getWindow(windowId: number): BrowserWindow | null {
    return this.windows.get(windowId) || null;
  }

  getWindowByContents(webContents: WebContents): BrowserWindow | null {
    for (const window of this.windows.values()) {
      if (window.webContents === webContents) {
        return window;
      }
    }
    return null;
  }

  getAllWindows(): BrowserWindow[] {
    return Array.from(this.windows.values());
  }

  closeAllWindows(): void {
    for (const window of this.windows.values()) {
      if (!window.isDestroyed()) {
        window.close();
      }
    }
    this.windows.clear();
    this.hiddenWindows.clear();
  }

  hideAllWindows(): void {
    for (const window of this.windows.values()) {
      if (!window.isDestroyed() && !window.isMinimized()) {
        window.hide();
      }
    }
  }

  showAllWindows(): void {
    for (const window of this.windows.values()) {
      if (!window.isDestroyed() && this.hiddenWindows.has(window.id)) {
        window.show();
      }
    }
  }

  async showDialog(options: MessageBoxOptions): Promise<Electron.MessageBoxReturnValue> {
    const focusedWindow = BrowserWindow.getFocusedWindow();
    return await dialog.showMessageBox(focusedWindow || this.getAllWindows()[0] || null, options);
  }

  showMessageBox(
    title: string,
    message: string,
    type: 'none' | 'info' | 'error' | 'question' | 'warning' = 'info'
  ): Promise<Electron.MessageBoxReturnValue> {
    return this.showDialog({
      type,
      title,
      message,
      buttons: ['OK'],
    });
  }

  showConfirmBox(
    title: string,
    message: string,
    confirmButton: string = 'OK',
    cancelButton: string = 'Cancel'
  ): Promise<Electron.MessageBoxReturnValue> {
    return this.showDialog({
      type: 'question',
      title,
      message,
      buttons: [confirmButton, cancelButton],
      defaultId: 0,
      cancelId: 1,
    });
  }
}

export class IPCChannel<T = unknown, R = unknown> {
  private channelName: string;
  private handler: (event: IpcMainInvokeEvent, ...args: unknown[]) => Promise<R> | R;

  constructor(channelName: string) {
    this.channelName = channelName;
    this.handler = async () => {
      throw new Error(`Handler not implemented for channel: ${channelName}`);
    };
  }

  setHandler(handler: (event: IpcMainInvokeEvent, ...args: unknown[]) => Promise<R> | R): this {
    this.handler = handler;
    return this;
  }

  register(): void {
    ipcMain.handle(this.channelName, async (event, ...args) => {
      try {
        return await this.handler(event, ...args);
      } catch (error) {
        console.error(`IPC Handler Error [${this.channelName}]:`, error);
        return { error: true, message: (error as Error).message };
      }
    });
  }

  unregister(): void {
    ipcMain.removeHandler(this.channelName);
  }
}

export class IPCRouter {
  private channels: Map<string, IPCChannel> = new Map();

  channel<T = unknown, R = unknown>(name: string): IPCChannel<T, R> {
    let channel = this.channels.get(name);
    if (!channel) {
      channel = new IPCChannel<T, R>(name);
      this.channels.set(name, channel);
    }
    return channel as IPCChannel<T, R>;
  }

  register(
    name: string,
    handler: (event: IpcMainInvokeEvent, ...args: unknown[]) => Promise<unknown> | unknown
  ): void {
    this.channel(name).setHandler(handler).register();
  }

  unregister(name: string): void {
    const channel = this.channels.get(name);
    if (channel) {
      channel.unregister();
      this.channels.delete(name);
    }
  }

  unregisterAll(): void {
    for (const channel of this.channels.values()) {
      channel.unregister();
    }
    this.channels.clear();
  }
}

export class AppLifecycle {
  static onReady(callback: () => void | Promise<void>): void {
    app.whenReady().then(async () => {
      await callback();
    });
  }

  static onWindowAllClosed(callback: () => void): void {
    app.on('window-all-closed', callback);
  }

  static onActivate(callback: () => void): void {
    app.on('activate', callback);
  }

  static onBeforeQuit(callback: () => void | Promise<void>): void {
    app.on('before-quit', callback);
  }

  static onWillQuit(callback: () => void | Promise<void>): void {
    app.on('will-quit', callback);
  }

  static quit(): void {
    app.quit();
  }

  static exit(code: number = 0): void {
    app.exit(code);
  }

  static getVersion(): string {
    return app.getVersion();
  }

  static getName(): string {
    return app.getName();
  }

  static getPath(
    name:
      | 'home'
      | 'appData'
      | 'userData'
      | 'temp'
      | 'exe'
      | 'module'
      | 'desktop'
      | 'documents'
      | 'downloads'
      | 'music'
      | 'pictures'
      | 'videos'
      | 'crashDumps'
  ): string {
    return app.getPath(name);
  }

  static isReady(): boolean {
    return app.isReady();
  }

  static isDefaultProtocolClient(protocol: string): boolean {
    return app.isDefaultProtocolClient(protocol);
  }

  static async setAsDefaultProtocolClient(protocol: string): Promise<boolean> {
    return app.setAsDefaultProtocolClient(protocol);
  }

  static async removeAsDefaultProtocolClient(protocol: string): Promise<boolean> {
    return app.removeAsDefaultProtocolClient(protocol);
  }

  static setAboutPanelMenu(menu: Electron.MenuItemConstructorOptions[]): void {
    if ('setAboutPanelMenu' in app && typeof app.setAboutPanelMenu === 'function') {
      (
        app as Electron.App & {
          setAboutPanelMenu: (menu: Electron.MenuItemConstructorOptions[]) => void;
        }
      ).setAboutPanelMenu(menu);
    }
  }

  static showAboutPanel(options?: Record<string, string>): void {
    if ('showAboutPanel' in app && typeof app.showAboutPanel === 'function') {
      (
        app as Electron.App & { showAboutPanel: (options?: Record<string, string>) => void }
      ).showAboutPanel(options);
    }
  }
}

export class SettingsManager {
  private store: Map<string, unknown>;
  private defaults: Record<string, unknown>;

  constructor(defaults: Record<string, unknown> = {}) {
    this.store = new Map();
    this.defaults = defaults;
  }

  get<T = unknown>(key: string, defaultValue: T | null = null): T | null {
    const fullKey = `setting.${key}`;
    const value = this.store.get(fullKey);
    if (value !== undefined) return value as T;
    if (this.defaults[key] !== undefined) return this.defaults[key] as T;
    return defaultValue;
  }

  set<T>(key: string, value: T): void {
    const fullKey = `setting.${key}`;
    this.store.set(fullKey, value);
  }

  has(key: string): boolean {
    const fullKey = `setting.${key}`;
    return this.store.has(fullKey) || this.defaults[key] !== undefined;
  }

  delete(key: string): boolean {
    const fullKey = `setting.${key}`;
    return this.store.delete(fullKey);
  }

  getAll(): Record<string, unknown> {
    const settings: Record<string, unknown> = { ...this.defaults };
    for (const [key, value] of this.store.entries()) {
      if (key.startsWith('setting.')) {
        const settingKey = key.replace('setting.', '');
        settings[settingKey] = value;
      }
    }
    return settings;
  }

  setAll(settings: Record<string, unknown>): void {
    for (const [key, value] of Object.entries(settings)) {
      this.set(key, value);
    }
  }

  reset(): void {
    this.store.clear();
  }

  loadFromFile(filePath: string): Promise<boolean> {
    return import('node:fs/promises').then(async (fs) => {
      try {
        const content = await fs.readFile(filePath, 'utf8');
        const data = JSON.parse(content);
        this.setAll(data);
        return true;
      } catch (error) {
        console.error('Failed to load settings from file:', error);
        return false;
      }
    });
  }

  saveToFile(filePath: string): Promise<boolean> {
    return import('node:fs/promises').then(async (fs) => {
      try {
        const data = this.getAll();
        await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
        return true;
      } catch (error) {
        console.error('Failed to save settings to file:', error);
        return false;
      }
    });
  }
}

export class DataStore {
  private store: Map<string, unknown>;

  constructor() {
    this.store = new Map();
  }

  get<T = unknown>(key: string): T | null {
    return this.store.get(key) as T | null;
  }

  set<T>(key: string, value: T): void {
    this.store.set(key, value);
  }

  has(key: string): boolean {
    return this.store.has(key);
  }

  delete(key: string): boolean {
    return this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }

  keys(): string[] {
    return Array.from(this.store.keys());
  }

  values<T>(): T[] {
    return Array.from(this.store.values()) as T[];
  }

  entries<T>(): [string, T][] {
    return Array.from(this.store.entries()) as [string, T][];
  }

  get size(): number {
    return this.store.size;
  }
}

export class MenuBuilder {
  private template: Electron.MenuItemConstructorOptions[];
  private menu: Electron.Menu | null = null;

  constructor(template: Electron.MenuItemConstructorOptions[] = []) {
    this.template = template;
  }

  setTemplate(template: Electron.MenuItemConstructorOptions[]): this {
    this.template = template;
    this.menu = null;
    return this;
  }

  addItem(
    label: string,
    click: (
      menuItem: Electron.MenuItem,
      window: Electron.BrowserWindow | undefined,
      event: Electron.KeyboardEvent
    ) => void,
    options: { accelerator?: string; enabled?: boolean; visible?: boolean } = {}
  ): this {
    // Create a click handler that matches the expected signature
    const clickHandler: Electron.MenuItemConstructorOptions['click'] = (
      menuItem: Electron.MenuItem,
      browserWindow: Electron.BaseWindow | undefined,
      event: Electron.KeyboardEvent
    ) => {
      click(menuItem, browserWindow as Electron.BrowserWindow | undefined, event);
    };

    this.template.push({
      label,
      click: clickHandler,
      accelerator: options.accelerator,
      enabled: options.enabled !== false,
      visible: options.visible !== false,
    });
    this.menu = null;
    return this;
  }

  addSeparator(): this {
    this.template.push({ type: 'separator' });
    this.menu = null;
    return this;
  }

  addSubmenu(label: string, submenu: Electron.MenuItemConstructorOptions[]): this {
    this.template.push({ label, submenu });
    this.menu = null;
    return this;
  }

  build(): Electron.Menu {
    if (this.menu) return this.menu;
    this.menu = Electron.Menu.buildFromTemplate(this.template);
    return this.menu;
  }

  setApplicationMenu(): void {
    const menu = this.build();
    Electron.Menu.setApplicationMenu(menu);
  }

  setContextMenu(menuItems: Electron.MenuItemConstructorOptions[]): Electron.Menu {
    const menu = Electron.Menu.buildFromTemplate(menuItems);
    menu.popup({});
    return menu;
  }
}

export class ProtocolHandler {
  static async registerProtocol(protocol: string): Promise<boolean> {
    if (process.defaultApp) {
      if (process.argv.length >= 2) {
        return app.setAsDefaultProtocolClient(protocol, process.execPath, [process.argv[1]]);
      }
    } else {
      return app.setAsDefaultProtocolClient(protocol);
    }
    return false;
  }

  static parseUrl(
    url: string
  ): { protocol: string; path: string; params: Record<string, string> } | null {
    try {
      const urlObj = new URL(url);
      const params: Record<string, string> = {};
      urlObj.searchParams.forEach((value, key) => {
        params[key] = value;
      });
      return {
        protocol: urlObj.protocol.replace(':', ''),
        path: urlObj.pathname,
        params,
      };
    } catch {
      return null;
    }
  }
}

export class PowerMonitor {
  static onSuspend(callback: () => void): void {
    require('electron').powerMonitor.on('suspend', callback);
  }

  static onResume(callback: () => void): void {
    require('electron').powerMonitor.on('resume', callback);
  }

  static onAC(callback: () => void): void {
    require('electron').powerMonitor.on('on-ac', callback);
  }

  static onBattery(callback: () => void): void {
    require('electron').powerMonitor.on('on-battery', callback);
  }

  static onLock(callback: () => void): void {
    require('electron').powerMonitor.on('lock-screen', callback);
  }

  static onUnlock(callback: () => void): void {
    require('electron').powerMonitor.on('unlock-screen', callback);
  }
}

export class TrayManager {
  private tray: Electron.Tray | null = null;
  private contextMenu: Electron.Menu | null = null;
  private tooltip: string = '';

  constructor(iconPath: string, tooltip: string = '') {
    this.tray = new Electron.Tray(iconPath);
    this.tooltip = tooltip;
    if (tooltip) {
      this.tray.setToolTip(tooltip);
    }
  }

  setTooltip(tooltip: string): this {
    this.tooltip = tooltip;
    if (this.tray) {
      this.tray.setToolTip(tooltip);
    }
    return this;
  }

  setImage(iconPath: string): this {
    if (this.tray) {
      this.tray.setImage(iconPath);
    }
    return this;
  }

  setPressedImage(iconPath: string): this {
    if (this.tray) {
      this.tray.setPressedImage(iconPath);
    }
    return this;
  }

  setContextMenu(menuItems: Electron.MenuItemConstructorOptions[]): this {
    this.contextMenu = Electron.Menu.buildFromTemplate(menuItems);
    if (this.tray) {
      this.tray.setContextMenu(this.contextMenu);
    }
    return this;
  }

  addContextItem(
    label: string,
    click: (
      menuItem: Electron.MenuItem,
      browserWindow: Electron.BrowserWindow | undefined,
      event: Electron.KeyboardEvent
    ) => void
  ): this {
    // Create a click handler that matches the expected signature
    const clickHandler: Electron.MenuItemConstructorOptions['click'] = (
      menuItem: Electron.MenuItem,
      browserWindow: Electron.BaseWindow | undefined,
      event: Electron.KeyboardEvent
    ) => {
      click(menuItem, browserWindow as Electron.BrowserWindow | undefined, event);
    };

    const newMenuItem: Electron.MenuItemConstructorOptions = {
      label,
      click: clickHandler,
    };

    // Build the template from scratch
    const items: Electron.MenuItemConstructorOptions[] = [];
    if (this.contextMenu) {
      for (const item of this.contextMenu.items) {
        items.push({
          label: item.label || '',
          type: item.type as any,
          click: item.click as any,
          submenu: item.submenu ? (item.submenu.items as any) : undefined,
          enabled: item.enabled,
          visible: item.visible,
          checked: item.checked,
          accelerator: item.accelerator,
        });
      }
    }

    items.push(newMenuItem);
    this.setContextMenu(items);
    return this;
  }

  addSeparator(): this {
    // Build the template from scratch
    const items: Electron.MenuItemConstructorOptions[] = [];
    if (this.contextMenu) {
      for (const item of this.contextMenu.items) {
        items.push({
          label: item.label || '',
          type: item.type as any,
          click: item.click as any,
          submenu: item.submenu ? (item.submenu.items as any) : undefined,
          enabled: item.enabled,
          visible: item.visible,
          checked: item.checked,
          accelerator: item.accelerator,
        });
      }
    }

    items.push({ type: 'separator' });
    this.setContextMenu(items);
    return this;
  }

  destroy(): void {
    if (this.tray) {
      this.tray.destroy();
      this.tray = null;
    }
  }

  getBounds(): Electron.Rectangle | null {
    return this.tray?.getBounds() || null;
  }
}

export class NotificationManager {
  static show(
    title: string,
    body: string,
    options: Electron.NotificationConstructorOptions = {}
  ): Electron.Notification {
    const notification = new Electron.Notification({
      title,
      body,
      ...options,
    });
    notification.show();
    return notification;
  }

  static async showAndWait(title: string, body: string, actions: string[] = []): Promise<string> {
    const notification = new Electron.Notification({
      title,
      body,
      actions: actions.map((action) => ({ type: 'button' as const, text: action })),
      closeButtonText: 'Close',
    });

    return new Promise((resolve) => {
      notification.on('action', (_event, index) => {
        resolve(actions[index] || '');
      });
      notification.on('close', () => {
        resolve('close');
      });
      notification.show();
    });
  }
}
