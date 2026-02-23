# DevTools Panel Documentation

## Overview

The DevTools panel is a comprehensive debugging tool built into the application, providing real-time visibility into both backend (Electron main process) and frontend (Vue renderer process) operations.

## Features

### 📋 Logs Tab
- Real-time console log interception from backend
- Frontend application logs
- Filter by level (info, warn, error, debug)
- Filter by source (backend, frontend, IPC, system)
- Search functionality
- Auto-scroll option

### 🔌 IPC Tab
- Monitor all Inter-Process Communication
- Track message direction (send/receive)
- View channel names and payloads
- Filter by direction and search
- Message timing information

### ⚡ Events Tab
- Application event tracking
- Event payload inspection
- Timestamp for each event
- Event flow visualization

### 🪟 Windows Tab
- List all open Electron windows
- Window properties (position, size, state)
- Focus/minimize/maximize status
- Real-time window state updates

### ℹ️ System Tab
- Application information (name, version)
- Electron/Node/Chrome versions
- Platform and architecture
- Memory usage (RSS, Heap)
- CPU usage
- Statistics dashboard

### ⚙️ Settings Tab
- View all application settings
- Real-time settings updates
- Setting key-value pairs inspection

## Usage

### Opening DevTools

**Method 1: Toggle Button**
- Click the blue DevTools button in the bottom-right corner

**Method 2: Keyboard Shortcut**
- Press `Ctrl+Shift+D` (Windows/Linux) or `Cmd+Shift+D` (macOS)

### Panel Controls

- **Tabs**: Navigate between different views
- **Search**: Filter logs/messages in current tab
- **Clear** (🗑️): Clear current tab data
- **Export** (⬇️): Export all data as JSON
- **Close** (✕): Close the panel
- **Resize**: Drag the top edge to resize panel

### Using the DevTools Composable

```typescript
import { useDevTools } from '@/frontend/composables/useDevTools';

// In a component setup
const { log, info, warn, error, debug, trackIpc, trackEvent } = useDevTools();

// Log messages
info('Component mounted', { component: 'MyComponent' });
warn('Deprecated API usage', { oldApi: 'xyz', newApi: 'abc' });
error('Failed to load data', { error: someError });
debug('Debug info', { data: complexObject });

// Track IPC calls with automatic timing
const result = await trackIpc('settings:get', { key: 'theme' }, async () => {
  return await window.electronAPI.getSetting('theme');
});

// Track custom events
trackEvent('user:action', { action: 'save', documentId: '123' });

// Track component lifecycle
trackComponent('MyComponent', 'mounted', { props: someProps });

// Track store actions
trackStoreAction('settings', 'update', { key: 'theme', value: 'dark' });

// Performance timing
startTimer('heavyOperation');
// ... do something ...
const duration = endTimer('heavyOperation', { result: someResult });
```

### Using the DevTools Store Directly

```typescript
import { useDevToolsStore } from '@/frontend/stores/devTools';
import { storeToRefs } from 'pinia';

const store = useDevToolsStore();
const { logs, ipcMessages, stats } = storeToRefs(store);

// Access data
console.log(`Total logs: ${logs.value.length}`);
console.log(`Error count: ${stats.value.errorCount}`);

// Add custom log
store.addLog({
  level: 'info',
  source: 'frontend',
  message: 'Custom log message',
  data: { custom: 'data' },
});

// Export data
store.exportData();
```

## Architecture

### Frontend Components

```
DevToolsPanel.vue          # Main panel UI
├── DevToolsStore          # Pinia state management
├── useDevTools composable # Vue composition API
└── DevTools styles        # Scoped CSS
```

### Backend Components

```
devtools-handlers.ts       # IPC handlers for DevTools
├── System info provider
├── Window info provider
├── Settings provider
└── Console interceptor
```

### Communication Flow

```
┌─────────────────┐
│  Frontend Vue   │
│   Component     │
└────────┬────────┘
         │ useDevTools()
         ↓
┌─────────────────┐
│  DevToolsStore  │
│    (Pinia)      │
└────────┬────────┘
         │ IPC
         ↓
┌─────────────────┐
│  DevTools IPC   │
│    Handlers     │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│  Backend Data   │
│ (System, Logs,  │
│   Windows, etc) │
└─────────────────┘
```

## IPC Channels

The DevTools uses these IPC channels:

| Channel | Direction | Description |
|---------|-----------|-------------|
| `devtools:system-info` | Frontend → Backend | Get system information |
| `devtools:windows` | Frontend → Backend | Get window list |
| `devtools:settings` | Frontend → Backend | Get all settings |
| `devtools:logs` | Frontend → Backend | Get backend logs |
| `devtools:clear-logs` | Frontend → Backend | Clear backend logs |
| `devtools:execute-command` | Frontend → Backend | Execute debug command |

## Debug Commands

Available commands via `devtools:execute-command`:

### `reload-window`
Reload the current window.

```typescript
await window.electronAPI.setSetting('devtools:execute-command', {
  command: 'reload-window',
  args: []
});
```

### `open-devtools`
Open Chrome DevTools for the current window.

### `close-devtools`
Close Chrome DevTools.

### `clear-cache`
Clear the browser cache.

### `clear-storage`
Clear all storage data (localStorage, sessionStorage, etc.).

### `get-process-info`
Get detailed process information.

### `gc`
Force garbage collection (requires `--expose-gc` flag).

## Customization

### Changing Panel Height

```typescript
import { useDevToolsStore } from '@/frontend/stores/devTools';

const store = useDevToolsStore();
store.setPanelHeight(400); // Height in pixels (150-600)
```

### Filtering Logs Programmatically

```typescript
const store = useDevToolsStore();

// Filter by levels
store.logFilter.levels = ['error', 'warn'];

// Filter by sources
store.logFilter.sources = ['backend', 'ipc'];

// Search
store.logFilter.search = 'my search term';
```

### Auto-scroll Control

```typescript
const store = useDevToolsStore();
store.autoScrollLogs = false;
store.autoScrollIpc = false;
```

## Best Practices

### 1. Use in Development Only

The DevTools panel is primarily a development tool. Consider disabling it in production:

```typescript
// main.ts
if (import.meta.env.DEV) {
  // Show DevTools
}
```

### 2. Limit Log Volume

Avoid excessive logging in production code:

```typescript
// Good
debug('Operation completed', { duration: 100 });

// Bad (too verbose)
debug('Step 1');
debug('Step 2');
debug('Step 3');
```

### 3. Use Structured Data

Provide structured data for easier debugging:

```typescript
// Good
info('API call', { 
  endpoint: '/users', 
  method: 'GET', 
  status: 200,
  duration: 45 
});

// Bad
info('API call /users GET 200 45ms');
```

### 4. Track Important Operations

Use `trackIpc` for all IPC calls to automatically log timing and results.

### 5. Export Data for Bug Reports

When reporting bugs, export DevTools data:
1. Open DevTools panel
2. Click Export button
3. Include JSON file with bug report

## Troubleshooting

### DevTools Panel Not Showing

1. Check if panel is open (click toggle button)
2. Verify DevTools handlers are registered in backend
3. Check browser console for errors

### Logs Not Appearing

1. Check log filters (levels, sources)
2. Verify console interception is working
3. Check if logs exceeded limit (1000 entries)

### IPC Messages Not Tracked

1. Ensure IPC calls use proper channels
2. Check if IPC bridge is functioning
3. Verify `trackIpc` is being used

### Performance Issues

If DevTools causes slowdown:
1. Reduce max log entries
2. Disable auto-scroll
3. Limit tracked events
4. Close panel when not needed

## Performance Impact

The DevTools panel has minimal performance impact:

- **Memory**: ~2-5 MB for logs buffer
- **CPU**: <1% during normal operation
- **Render**: Efficient virtual scrolling for large lists

## Security Considerations

⚠️ **Important**: The DevTools panel exposes internal application state.

- **Do not enable in production** without proper authentication
- **Sanitize sensitive data** in logs
- **Be cautious** when exporting data (may contain sensitive info)

## Future Enhancements

Planned features:
- [ ] Real-time performance graph
- [ ] Network request tracking
- [ ] State snapshots and time-travel debugging
- [ ] Custom plugins/extensions
- [ ] Remote debugging support
- [ ] Log persistence across sessions

## Related Documentation

- [Electron DevTools](https://www.electronjs.org/docs/latest/tutorial/devtools)
- [Vue DevTools](https://devtools.vuejs.org/)
- [Pinia DevTools](https://pinia.vuejs.org/cookbook/devtools.html)
