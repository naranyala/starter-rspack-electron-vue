// Dynamic menu configuration for the frontend fuzzy search
// This allows for modular design where menu items can be easily updated

// Define TypeScript interface for menu items
interface MenuItem {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
}

export const menuData: MenuItem[] = [
  {
    id: 'integration-file-system',
    title: 'File System Integration Demo',
    content:
      "<p><strong>Overview:</strong> This demo showcases Electron's powerful file system capabilities including reading, writing, and managing files directly from your desktop app.</p><p><strong>Features:</strong><br>• Drag and drop file uploads<br>• Real-time file monitoring<br>• Directory traversal and management<br>• File metadata extraction</p><p><strong>Use Case:</strong> Perfect for file managers, code editors, and document processors.</p>",
    category: 'file-system',
    tags: ['file-system', 'fs', 'drag-drop', 'file-management'],
  },
  {
    id: 'integration-system-tray',
    title: 'System Tray Integration Demo',
    content:
      '<p><strong>Overview:</strong> Demonstration of creating persistent system tray applications with custom icons, context menus, and notification handling.</p><p><strong>Features:</strong><br>• Custom tray icon with status indicators<br>• Right-click context menu<br>• Balloon notifications<br>• Minimize to tray functionality</p><p><strong>Use Case:</strong> Ideal for monitoring tools, music players, and background services.</p>',
    category: 'ui',
    tags: ['system-tray', 'notifications', 'context-menu', 'background'],
  },
  {
    id: 'integration-clipboard',
    title: 'Clipboard Integration Demo',
    content:
      '<p><strong>Overview:</strong> Explore clipboard manipulation including text, images, and rich content with history management.</p><p><strong>Features:</strong><br>• Read/write clipboard content<br>• Clipboard history tracking<br>• Image and rich text support<br>• Format detection and conversion</p><p><strong>Use Case:</strong> Great for clipboard managers, screenshot tools, and productivity apps.</p>',
    category: 'ui',
    tags: ['clipboard', 'copy-paste', 'clipboard-history', 'images'],
  },
  {
    id: 'integration-dialogs',
    title: 'Native Dialogs Demo',
    content:
      '<p><strong>Overview:</strong> Integration with native OS dialogs for file selection, folder browsing, and message prompts.</p><p><strong>Features:</strong><br>• Open/save file dialogs<br>• Directory selection<br>• Message boxes with buttons<br>• Progress indicators</p><p><strong>Use Case:</strong> Essential for file-based applications requiring user input and selection.</p>',
    category: 'ui',
    tags: ['dialogs', 'file-picker', 'user-input', 'native-ui'],
  },
  {
    id: 'integration-browser-window',
    title: 'Browser Window Management Demo',
    content:
      '<p><strong>Overview:</strong> Advanced window management including multiple windows, window states, and inter-window communication.</p><p><strong>Features:</strong><br>• Multiple window creation<br>• Window state persistence<br>• Parent-child window relationships<br>• Inter-window IPC messaging</p><p><strong>Use Case:</strong> Perfect for multi-window applications like IDEs, dashboards, and complex tools.</p>',
    category: 'windows',
    tags: ['windows', 'window-management', 'ipc', 'multi-window'],
  },
  {
    id: 'integration-menu',
    title: 'Native Menu Integration Demo',
    content:
      '<p><strong>Overview:</strong> Create native application menus, context menus, and tray menus with full OS integration.</p><p><strong>Features:</strong><br>• Main menu bar<br>• Application menu templates<br>• Custom context menus<br>• Keyboard shortcuts</p><p><strong>Use Case:</strong> Ideal for traditional desktop applications with native menu structures.</p>',
    category: 'ui',
    tags: ['menus', 'context-menu', 'shortcuts', 'native-ui'],
  },
  {
    id: 'integration-notifications',
    title: 'System Notifications Demo',
    content:
      '<p><strong>Overview:</strong> Native system notifications with custom actions, sounds, and notification center integration.</p><p><strong>Features:</strong><br>• Custom notification templates<br>• Action buttons<br>• Sound support<br>• Notification history</p><p><strong>Use Case:</strong> Perfect for reminders, chat apps, and monitoring tools.</p>',
    category: 'ui',
    tags: ['notifications', 'alerts', 'notification-center', 'actions'],
  },
  {
    id: 'integration-shell',
    title: 'Shell Operations Demo',
    content:
      '<p><strong>Overview:</strong> Integration with OS shell for opening files, URLs, and managing external applications.</p><p><strong>Features:</strong><br>• Open external URLs<br>• Launch default applications<br>• Show items in file manager<br>• Execute shell commands safely</p><p><strong>Use Case:</strong> Great for launchers, link handlers, and system utilities.</p>',
    category: 'system',
    tags: ['shell', 'external-links', 'file-manager', 'launch-app'],
  },
  {
    id: 'integration-screen',
    title: 'Screen Capture Demo',
    content:
      '<p><strong>Overview:</strong> Screen capture and display integration including window selection, screen recording, and desktop streaming.</p><p><strong>Features:</strong><br>• Screen capture APIs<br>• Window selection<br>• Multi-monitor support<br>• Display information</p><p><strong>Use Case:</strong> Essential for screen recorders, screenshot tools, and remote desktop apps.</p>',
    category: 'multimedia',
    tags: ['screen-capture', 'recording', 'displays', 'screenshot'],
  },
  {
    id: 'integration-network',
    title: 'Network Integration Demo',
    content:
      '<p><strong>Overview:</strong> Network status monitoring, proxy configuration, and network request management.</p><p><strong>Features:</strong><br>• Network status detection<br>• Proxy configuration<br>• HTTP request interception<br>• Offline/online detection</p><p><strong>Use Case:</strong> Perfect for network-aware applications requiring connectivity monitoring.</p>',
    category: 'system',
    tags: ['network', 'proxy', 'offline', 'connectivity'],
  },
  {
    id: 'integration-global-shortcuts',
    title: 'Global Shortcuts Demo',
    content:
      '<p><strong>Overview:</strong> Global keyboard shortcut registration that works even when the application is not focused.</p><p><strong>Features:</strong><br>• Global hotkey registration<br>• Media key support<br>• Conflict detection<br>• Shortcut persistence</p><p><strong>Use Case:</strong> Ideal for media players, productivity tools, and system utilities.</p>',
    category: 'system',
    tags: ['shortcuts', 'hotkeys', 'keyboard', 'global-events'],
  },
  {
    id: 'integration-app-badge',
    title: 'App Badge and Dock Demo',
    content:
      '<p><strong>Overview:</strong> Application badge integration for dock/taskbar icons to show unread counts or status indicators.</p><p><strong>Features:</strong><br>• Badge counter<br>• Dock menu integration<br>• Progress indicators<br>• Status updates</p><p><strong>Use Case:</strong> Great for communication apps, email clients, and notification tools.</p>',
    category: 'ui',
    tags: ['badge', 'dock', 'taskbar', 'status-indicator'],
  },
  {
    id: 'integration-power-monitor',
    title: 'Power Monitor Demo',
    content:
      '<p><strong>Overview:</strong> System power state monitoring including battery status, suspend/resume events, and power management.</p><p><strong>Features:</strong><br>• Battery status monitoring<br>• Power state changes<br>• Suspend/resume detection<br>• Throttling awareness</p><p><strong>Use Case:</strong> Essential for battery-aware applications and power optimization tools.</p>',
    category: 'system',
    tags: ['power', 'battery', 'suspend', 'energy-management'],
  },
  {
    id: 'integration-native-theme',
    title: 'Native Theme Demo',
    content:
      '<p><strong>Overview:</strong> Integration with OS dark/light mode and automatic theme switching based on system preferences.</p><p><strong>Features:</strong><br>• Dark/light mode detection<br>• Theme change events<br>• System preference syncing<br>• Accent color support</p><p><strong>Use Case:</strong> Perfect for applications that need to adapt to system appearance settings.</p>',
    category: 'ui',
    tags: ['theme', 'dark-mode', 'system-preferences', 'appearance'],
  },
  {
    id: 'integration-web-contents',
    title: 'Web Contents Control Demo',
    content:
      '<p><strong>Overview:</strong> Advanced control over web content including zoom, navigation, and developer tools integration.</p><p><strong>Features:</strong><br>• Zoom control<br>• Navigation history<br>• DevTools integration<br>• Print functionality</p><p><strong>Use Case:</strong> Great for browsers, help viewers, and web-based interfaces.</p>',
    category: 'windows',
    tags: ['web-contents', 'navigation', 'zoom', 'devtools'],
  },
  {
    id: 'integration-auto-updater',
    title: 'Auto Updater Demo',
    content:
      '<p><strong>Overview:</strong> Automatic application updates with version checking, download progress, and installation handling.</p><p><strong>Features:</strong><br>• Version checking<br>• Background downloads<br>• Update notifications<br>• Rollback support</p><p><strong>Use Case:</strong> Essential for production applications requiring seamless updates.</p>',
    category: 'system',
    tags: ['updates', 'auto-update', 'versioning', 'maintenance'],
  },
];

export const filterCategories = [
  { id: 'all', label: 'All Demos' },
  { id: 'file-system', label: 'File System' },
  { id: 'ui', label: 'UI Components' },
  { id: 'windows', label: 'Window Management' },
  { id: 'system', label: 'System Integration' },
  { id: 'multimedia', label: 'Multimedia' },
];
