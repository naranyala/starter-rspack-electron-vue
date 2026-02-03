/**
 * Theme generation utilities for window components
 */
export function generateTheme(title: string): { bg: string; color: string; accent: string } {
  const darkBg = '#1a1a1a';
  const darkText = '#f0f0f0';
  const accentFallback = '#818cf8';

  const accentColors: Record<string, string> = {
    'File System Integration Demo': '#818cf8',
    'System Tray Integration Demo': '#f59e0b',
    'Clipboard Integration Demo': '#10b981',
    'Native Dialogs Demo': '#ef4444',
    'Browser Window Management Demo': '#8b5cf6',
    'Native Menu Integration Demo': '#ec4899',
    'System Notifications Demo': '#06b6d4',
    'Shell Operations Demo': '#f97316',
    'Screen Capture Demo': '#84cc16',
    'Network Integration Demo': '#14b8a6',
    'Global Shortcuts Demo': '#a855f7',
    'App Badge and Dock Demo': '#6366f1',
    'Power Monitor Demo': '#22c55e',
    'Native Theme Demo': '#0ea5e9',
    'Web Contents Control Demo': '#f43f5e',
    'Auto Updater Demo': '#eab308',
  };

  const windowAccent = accentColors[title] || accentFallback;

  return {
    bg: darkBg,
    color: darkText,
    accent: windowAccent,
  };
}

/**
 * Generate dynamic content based on the title
 */
export function generateWindowContent(title: string): string {
  const contentMap: Record<string, string> = {
    'File System Integration Demo': `
      <h4>Overview</h4>
      <p>This demo showcases Electron's powerful file system capabilities including reading, writing, and managing files directly from your desktop app.</p>
      <h4>Key Features</h4>
      <ul>
        <li>Drag and drop file uploads</li>
        <li>Real-time file monitoring</li>
        <li>Directory traversal and management</li>
        <li>File metadata extraction</li>
      </ul>
      <h4>Use Cases</h4>
      <p>Perfect for file managers, code editors, and document processors.</p>
    `,
    'System Tray Integration Demo': `
      <h4>Overview</h4>
      <p>Demonstration of creating persistent system tray applications with custom icons, context menus, and notification handling.</p>
      <h4>Key Features</h4>
      <ul>
        <li>Custom tray icon with status indicators</li>
        <li>Right-click context menu</li>
        <li>Balloon notifications</li>
        <li>Minimize to tray functionality</li>
      </ul>
      <h4>Use Cases</h4>
      <p>Ideal for monitoring tools, music players, and background services.</p>
    `,
    'Clipboard Integration Demo': `
      <h4>Overview</h4>
      <p>Explore clipboard manipulation including text, images, and rich content with history management.</p>
      <h4>Key Features</h4>
      <ul>
        <li>Read/write clipboard content</li>
        <li>Clipboard history tracking</li>
        <li>Image and rich text support</li>
        <li>Format detection and conversion</li>
      </ul>
      <h4>Use Cases</h4>
      <p>Great for clipboard managers, screenshot tools, and productivity apps.</p>
    `,
    'Native Dialogs Demo': `
      <h4>Overview</h4>
      <p>Integration with native OS dialogs for file selection, folder browsing, and message prompts.</p>
      <h4>Key Features</h4>
      <ul>
        <li>Open/save file dialogs</li>
        <li>Directory selection</li>
        <li>Message boxes with buttons</li>
        <li>Progress indicators</li>
      </ul>
      <h4>Use Cases</h4>
      <p>Essential for file-based applications requiring user input and selection.</p>
    `,
    'Browser Window Management Demo': `
      <h4>Overview</h4>
      <p>Advanced window management including multiple windows, window states, and inter-window communication.</p>
      <h4>Key Features</h4>
      <ul>
        <li>Multiple window creation</li>
        <li>Window state persistence</li>
        <li>Parent-child window relationships</li>
        <li>Inter-window IPC messaging</li>
      </ul>
      <h4>Use Cases</h4>
      <p>Perfect for multi-window applications like IDEs, dashboards, and complex tools.</p>
    `,
    'Native Menu Integration Demo': `
      <h4>Overview</h4>
      <p>Create native application menus, context menus, and tray menus with full OS integration.</p>
      <h4>Key Features</h4>
      <ul>
        <li>Main menu bar</li>
        <li>Application menu templates</li>
        <li>Custom context menus</li>
        <li>Keyboard shortcuts</li>
      </ul>
      <h4>Use Cases</h4>
      <p>Ideal for traditional desktop applications with native menu structures.</p>
    `,
    'System Notifications Demo': `
      <h4>Overview</h4>
      <p>Native system notifications with custom actions, sounds, and notification center integration.</p>
      <h4>Key Features</h4>
      <ul>
        <li>Custom notification templates</li>
        <li>Action buttons</li>
        <li>Sound support</li>
        <li>Notification history</li>
      </ul>
      <h4>Use Cases</h4>
      <p>Perfect for reminders, chat apps, and monitoring tools.</p>
    `,
    'Shell Operations Demo': `
      <h4>Overview</h4>
      <p>Integration with OS shell for opening files, URLs, and managing external applications.</p>
      <h4>Key Features</h4>
      <ul>
        <li>Open external URLs</li>
        <li>Launch default applications</li>
        <li>Show items in file manager</li>
        <li>Execute shell commands safely</li>
      </ul>
      <h4>Use Cases</h4>
      <p>Great for launchers, link handlers, and system utilities.</p>
    `,
    'Screen Capture Demo': `
      <h4>Overview</h4>
      <p>Screen capture and display integration including window selection, screen recording, and desktop streaming.</p>
      <h4>Key Features</h4>
      <ul>
        <li>Screen capture APIs</li>
        <li>Window selection</li>
        <li>Multi-monitor support</li>
        <li>Display information</li>
      </ul>
      <h4>Use Cases</h4>
      <p>Essential for screen recorders, screenshot tools, and remote desktop apps.</p>
    `,
    'Network Integration Demo': `
      <h4>Overview</h4>
      <p>Network status monitoring, proxy configuration, and network request management.</p>
      <h4>Key Features</h4>
      <ul>
        <li>Network status detection</li>
        <li>Proxy configuration</li>
        <li>HTTP request interception</li>
        <li>Offline/online detection</li>
      </ul>
      <h4>Use Cases</h4>
      <p>Perfect for network-aware applications requiring connectivity monitoring.</p>
    `,
    'Global Shortcuts Demo': `
      <h4>Overview</h4>
      <p>Global keyboard shortcut registration that works even when the application is not focused.</p>
      <h4>Key Features</h4>
      <ul>
        <li>Global hotkey registration</li>
        <li>Media key support</li>
        <li>Conflict detection</li>
        <li>Shortcut persistence</li>
      </ul>
      <h4>Use Cases</h4>
      <p>Ideal for media players, productivity tools, and system utilities.</p>
    `,
    'App Badge and Dock Demo': `
      <h4>Overview</h4>
      <p>Application badge integration for dock/taskbar icons to show unread counts or status indicators.</p>
      <h4>Key Features</h4>
      <ul>
        <li>Badge counter</li>
        <li>Dock menu integration</li>
        <li>Progress indicators</li>
        <li>Status updates</li>
      </ul>
      <h4>Use Cases</h4>
      <p>Great for communication apps, email clients, and notification tools.</p>
    `,
    'Power Monitor Demo': `
      <h4>Overview</h4>
      <p>System power state monitoring including battery status, suspend/resume events, and power management.</p>
      <h4>Key Features</h4>
      <ul>
        <li>Battery status monitoring</li>
        <li>Power state changes</li>
        <li>Suspend/resume detection</li>
        <li>Throttling awareness</li>
      </ul>
      <h4>Use Cases</h4>
      <p>Essential for battery-aware applications and power optimization tools.</p>
    `,
    'Native Theme Demo': `
      <h4>Overview</h4>
      <p>Integration with OS dark/light mode and automatic theme switching based on system preferences.</p>
      <h4>Key Features</h4>
      <ul>
        <li>Dark/light mode detection</li>
        <li>Theme change events</li>
        <li>System preference syncing</li>
        <li>Accent color support</li>
      </ul>
      <h4>Use Cases</h4>
      <p>Perfect for applications that need to adapt to system appearance settings.</p>
    `,
    'Web Contents Control Demo': `
      <h4>Overview</h4>
      <p>Advanced control over web content including zoom, navigation, and developer tools integration.</p>
      <h4>Key Features</h4>
      <ul>
        <li>Zoom control</li>
        <li>Navigation history</li>
        <li>DevTools integration</li>
        <li>Print functionality</li>
      </ul>
      <h4>Use Cases</h4>
      <p>Great for browsers, help viewers, and web-based interfaces.</p>
    `,
    'Auto Updater Demo': `
      <h4>Overview</h4>
      <p>Automatic application updates with version checking, download progress, and installation handling.</p>
      <h4>Key Features</h4>
      <ul>
        <li>Version checking</li>
        <li>Background downloads</li>
        <li>Update notifications</li>
        <li>Rollback support</li>
      </ul>
      <h4>Use Cases</h4>
      <p>Essential for production applications requiring seamless updates.</p>
    `,
  };

  return contentMap[title] || `<p>Content for ${title} is coming soon.</p>`;
}
