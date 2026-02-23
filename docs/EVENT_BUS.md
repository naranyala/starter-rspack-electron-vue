# Event Bus System Documentation

## Overview

The Event Bus system provides type-safe, cross-process communication for the Electron application. It enables:

- **Backend (Main Process)**: Services and IPC handlers to communicate
- **Frontend (Renderer Process)**: Vue components to communicate with each other and backend
- **Cross-Process**: Events to flow between main and renderer processes

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Backend (Main Process)                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              BackendEventBus                              │   │
│  │  - Extends core EventBus                                  │   │
│  │  - IPC handler registration                               │   │
│  │  - Window subscription tracking                           │   │
│  │  - App lifecycle integration                              │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              │                                   │
│                              │ IPC                               │
│                              ▼                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              preload.ts (Context Bridge)                  │   │
│  │  - eventSubscribe()                                       │   │
│  │  - eventUnsubscribe()                                     │   │
│  │  - eventEmit()                                            │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ IPC
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Frontend (Renderer Process)                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              FrontendEventBus                             │   │
│  │  - Extends core EventBus                                  │   │
│  │  - IPC communication with backend                         │   │
│  │  - Vue composable integration                             │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              │                                   │
│                              │ uses                              │
│                              ▼                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              useEventBus() Composable                     │   │
│  │  - Reactive event handling in Vue components              │   │
│  │  - Automatic cleanup on unmount                           │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## Event Types

### Pre-defined Event Categories

```typescript
// App lifecycle events
'app:initialized'    // App has initialized
'app:ready'          // App is ready
'app:before-quit'    // App is about to quit
'app:quit'           // App has quit

// Window management events (WinBox-based)
'window:created'     // New WinBox window created
'window:closed'      // WinBox window closed
'window:focus'       // Window focused
'window:blur'        // Window blurred
'window:minimize'    // Window minimized
'window:maximize'    // Window maximized
'window:restore'     // Window restored

// Settings events
'settings:changed'   // Setting value changed
'settings:loaded'    // Settings loaded from storage
'settings:reset'     // Settings reset to defaults

// User interaction events
'user:action'        // User performed action
'user:preference-change' // User preference changed

// Cross-process events
'cross:sync'         // Cross-process sync
'cross:notification' // Cross-process notification

// Error events
'error:uncaught'     // Uncaught error
'error:handled'      // Handled error
```

### Creating Custom Events

```typescript
// src/shared/events/event-types.ts

export interface EventMap {
  // Add your custom events here
  'my:custom-event': { data: string; count: number };
  'my:another-event': void;  // Events without payload
}
```

## Backend Usage

### Initialize Event Bus

```typescript
// src/backend/main.ts
import { initializeBackendEventBus, getBackendEventBus } from './events/backend-event-bus';

const bootstrap = () => {
  // Initialize event bus
  initializeBackendEventBus();
  const eventBus = getBackendEventBus();

  // Emit events
  eventBus.emit('app:initialized', { version: app.getVersion() });
  
  // Subscribe to events
  eventBus.on('settings:changed', (payload) => {
    console.log('Settings changed:', payload);
  });
};
```

### Emit Events from Services

```typescript
// src/backend/services/window-manager.ts
import { getBackendEventBus } from '../events/backend-event-bus';

export class WindowManager {
  createWindow(options: Electron.BrowserWindowConstructorOptions) {
    const window = new BrowserWindow(options);
    
    // Emit window created event
    const eventBus = getBackendEventBus();
    eventBus.emit('window:created', { 
      windowId: window.id, 
      title: options.title 
    });
    
    return window;
  }
}
```

### Subscribe to Events

```typescript
// Subscribe with options
eventBus.on('window:closed', (payload) => {
  console.log(`Window ${payload.windowId} closed`);
}, {
  priority: 10,  // Higher priority = executed first
  once: false,   // Set to true for one-time subscription
});

// Subscribe once
eventBus.once('app:before-quit', () => {
  console.log('Cleaning up before quit');
});
```

## Frontend Usage

### Initialize Event Bus

```typescript
// src/frontend/main.ts
import { initializeFrontendEventBus } from './events/frontend-event-bus';

initializeFrontendEventBus().then(() => {
  // Event bus ready
  app.mount('#root');
});
```

### Using Vue Composables

```vue
<!-- Basic event handling -->
<script setup lang="ts">
import { useEventBus } from '@/frontend/events/useEventBus';

const { on, emit, unsubscribeAll } = useEventBus();

// Subscribe to settings changes
on('settings:changed', (payload) => {
  console.log('Settings changed:', payload);
});

// Emit events
async function updateTheme() {
  await emit('user:preference-change', {
    category: 'appearance',
    preference: 'theme',
    value: 'dark',
  });
}
</script>
```

### Reactive Event State

```vue
<script setup lang="ts">
import { useEvent } from '@/frontend/events/useEventBus';

// Reactive event data
const { data: settings, count, lastUpdated } = useEvent('settings:changed');
</script>

<template>
  <div>
    <p>Settings updated {{ count }} times</p>
    <p>Last update: {{ lastUpdated }}</p>
    <pre>{{ settings }}</pre>
  </div>
</template>
```

### Event History

```vue
<script setup lang="ts">
import { useEventHistory } from '@/frontend/events/useEventBus';

// Track last 10 window events
const { history, clear } = useEventHistory('window:created', 10);
</script>

<template>
  <div>
    <h3>Window Creation History</h3>
    <ul>
      <li v-for="event in history" :key="event.timestamp">
        {{ new Date(event.timestamp).toLocaleTimeString() }} - 
        Window {{ event.payload.windowId }}
      </li>
    </ul>
    <button @click="clear">Clear History</button>
  </div>
</template>
```

### Event Statistics

```vue
<script setup lang="ts">
import { useEventStats } from '@/frontend/events/useEventBus';

const { stats, refresh, reset } = useEventStats();
</script>

<template>
  <div>
    <p>Total Events: {{ stats.totalEvents }}</p>
    <p>Active Subscriptions: {{ stats.activeSubscriptions }}</p>
    <button @click="refresh">Refresh</button>
    <button @click="reset">Reset Stats</button>
  </div>
</template>
```

## Cross-Process Communication

### Frontend to Backend

```typescript
// Frontend component emits event
await emit('user:action', {
  action: 'open-window',
  details: { title: 'My Window' },
});

// Backend receives and processes
eventBus.on('user:action', (payload) => {
  if (payload.action === 'open-window') {
    // Create window using WinBox
    WindowManager.createWindow({ title: payload.details.title });
  }
});
```

### Backend to Frontend

```typescript
// Backend emits event
eventBus.emit('window:created', { windowId: 123, title: 'New Window' });

// Frontend receives automatically (if subscribed)
on('window:created', (payload) => {
  console.log('New window created:', payload);
});
```

## Advanced Features

### Priority-based Execution

```typescript
// Higher priority handlers execute first
eventBus.on('app:ready', handler1, { priority: 10 });
eventBus.on('app:ready', handler2, { priority: 5 });
eventBus.on('app:ready', handler3, { priority: 1 });

// Order: handler1 -> handler2 -> handler3
```

### Debouncing and Throttling

```typescript
// Debounce rapid settings changes
eventBus.on('settings:changed', handleSettingsChange, {
  debounce: 300,  // Wait 300ms after last event
});

// Throttle frequent window events
eventBus.on('window:focus', handleWindowFocus, {
  throttle: 1000,  // Max once per second
});
```

### Event Correlation

```typescript
// Set correlation ID for tracing
eventBus.setCorrelationId('user-session-123');

// All events will include this correlation ID
await eventBus.emit('user:action', { action: 'login' });
await eventBus.emit('settings:changed', { key: 'theme' });

// Clear when done
eventBus.clearCorrelationId();
```

### Event History

```typescript
// Get event history
const history = eventBus.getHistory('window:created', 10);

// Clear specific event history
eventBus.clearHistory('settings:changed');

// Clear all history
eventBus.clearHistory();
```

## WinBox Integration

The Event Bus integrates with WinBox.js for window management:

```typescript
// src/frontend/services/window-factory.ts
import { getFrontendEventBus } from '../events/frontend-event-bus';

export class WindowFactory {
  static createWindow(title: string, options: WindowOptions = {}) {
    const winbox = new WinBox({ title, ...options });
    
    // Emit window created event
    const eventBus = getFrontendEventBus();
    eventBus.emit('window:created', {
      windowId: winbox.id,
      title,
    });
    
    // Listen for window close
    winbox.onclose = () => {
      eventBus.emit('window:closed', { windowId: winbox.id });
    };
    
    return winbox;
  }
}
```

## Best Practices

### 1. Type Safety

Always define event types in `EventMap`:

```typescript
export interface EventMap {
  'my:event': { payload: string };
}
```

### 2. Cleanup

Use composables for automatic cleanup:

```typescript
// ✅ Good - automatic cleanup
const { on } = useEventBus();

// ❌ Manual cleanup required
const eventBus = getFrontendEventBus();
eventBus.on('event', handler);
```

### 3. Error Handling

Event bus handles errors gracefully:

```typescript
// Failed handlers don't break other handlers
eventBus.on('event', () => { throw new Error('Oops'); });
eventBus.on('event', () => { /* This still runs */ });
```

### 4. Performance

Use priority and throttling for expensive operations:

```typescript
// High priority for critical handlers
eventBus.on('app:before-quit', saveData, { priority: 100 });

// Throttle frequent events
eventBus.on('window:focus', updateUI, { throttle: 500 });
```

### 5. Debugging

Enable debug mode in development:

```typescript
const eventBus = createEventBus({
  debug: true,  // Logs all events
  enableHistory: true,
});
```

## API Reference

### EventBus Class

| Method | Description |
|--------|-------------|
| `on(event, handler, options)` | Subscribe to event |
| `once(event, handler)` | Subscribe once |
| `off(event, subscription)` | Unsubscribe |
| `offAll(event?)` | Unsubscribe all |
| `emit(event, payload)` | Emit event |
| `getHistory(event?, limit?)` | Get event history |
| `clearHistory(event?)` | Clear history |
| `getStats()` | Get statistics |
| `resetStats()` | Reset statistics |
| `destroy()` | Cleanup |

### Composables

| Composable | Description |
|------------|-------------|
| `useEventBus()` | Basic event handling |
| `useEvent(event)` | Reactive event state |
| `useEventHistory(event, limit)` | Event history |
| `useEventStats()` | Event statistics |

## Testing

```typescript
import { createEventBus } from '@/shared/events/event-bus';

describe('Event Bus', () => {
  it('should emit and receive events', async () => {
    const eventBus = createEventBus();
    let received: unknown;
    
    eventBus.on('test:event', (payload) => {
      received = payload;
    });
    
    await eventBus.emit('test:event', { data: 'test' });
    
    expect(received).toEqual({ data: 'test' });
  });
});
```
