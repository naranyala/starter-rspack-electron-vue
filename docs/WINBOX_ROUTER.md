# WinBox.js as Router-Like Solution

## Overview

This Electron + Vue application uses **WinBox.js** as the primary window management and navigation solution instead of traditional Vue Router. This approach provides a native desktop experience with true multi-window capabilities.

## Why WinBox Instead of Vue Router?

| Aspect | Vue Router | WinBox.js |
|--------|-----------|-----------|
| Navigation Model | URL/hash-based | Window-based |
| Multi-view | Single view at a time | Multiple independent windows |
| Window Management | Browser-native only | Full control (drag, resize, minimize) |
| Desktop Feel | Web-like | Native desktop application |
| State Isolation | Shared state | Isolated per window |
| Multi-tasking | Limited | Full multi-tasking |

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      HomeView (Dashboard)                    │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Search & Filter Integration Demos                   │    │
│  │  [Card 1] [Card 2] [Card 3] ...                      │    │
│  └─────────────────────────────────────────────────────┘    │
│                            │                                  │
│                            │ Click Card                       │
│                            ▼                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │  WinBox 1   │  │  WinBox 2   │  │  WinBox 3   │          │
│  │  Feature A  │  │  Feature B  │  │  Feature C  │          │
│  │  [Close]    │  │  [Close]    │  │  [Close]    │          │
│  └─────────────┘  └─────────────┘  └─────────────┘          │
└─────────────────────────────────────────────────────────────┘
```

## Implementation

### Window Factory Service

```typescript
// src/frontend/services/window-factory.ts
export class WindowFactory {
  static createWindow(
    title: string, 
    customContent: string | null = null,
    options: WindowOptions = {}
  ): WinBoxWindow {
    const winbox = new WinBox({
      title,
      html: generateWindowContent(title),
      width: '550px',
      height: '450px',
      x: 'center',
      y: 'center',
      class: 'winbox-dark',
      ...options,
    });

    // Emit event for cross-window communication
    const eventBus = getFrontendEventBus();
    eventBus.emit('window:created', {
      windowId: winbox.id,
      title,
    });

    // Handle window close
    winbox.onclose = () => {
      eventBus.emit('window:closed', { windowId: winbox.id });
    };

    return winbox;
  }
}
```

### Usage in Components

```vue
<script setup lang="ts">
import { WindowFactory } from '@/frontend/services/window-factory';

function openFeatureWindow(featureTitle: string) {
  const winbox = WindowFactory.createWindow(featureTitle, null, {
    width: '600px',
    height: '500px',
    onclose: () => {
      console.log('Window closed');
    },
  });
}
</script>

<template>
  <div class="cards-list">
    <div 
      v-for="card in cards" 
      :key="card.id"
      class="card"
      @click="openFeatureWindow(card.title)"
    >
      {{ card.title }}
    </div>
  </div>
</template>
```

### Cross-Window Communication via Event Bus

```typescript
// Window A: Emit event
const eventBus = getFrontendEventBus();
await eventBus.emit('user:action', {
  action: 'open-window',
  details: { title: 'New Window' },
});

// Window B: Listen for events
const { on } = useEventBus();
on('user:action', (payload) => {
  if (payload.action === 'open-window') {
    WindowFactory.createWindow(payload.details.title);
  }
});
```

## Window Management Features

### Window Options

```typescript
interface WindowOptions {
  title?: string;
  width?: string;
  height?: string;
  x?: string | number;  // 'center', 'left', 'right', or pixel value
  y?: string | number;  // 'center', 'top', 'bottom', or pixel value
  minwidth?: number;
  minheight?: number;
  maxwidth?: number;
  maxheight?: number;
  background?: string;  // Background color
  class?: string;       // CSS class for styling
  onclose?: () => boolean | void;
  onfocus?: () => void;
  onblur?: () => void;
  onmove?: (x: number, y: number) => void;
  onresize?: (w: number, h: number) => void;
}
```

### Window Controls

```typescript
const winbox = WindowFactory.createWindow('My Window');

// Minimize
winbox.minimize();

// Maximize
winbox.maximize();

// Restore
winbox.restore();

// Focus
winbox.focus();

// Close
winbox.close();

// Set position
winbox.move(100, 100);

// Set size
winbox.resize(800, 600);

// Set title
winbox.setTitle('New Title');

// Set background color
winbox.setBackground('#333');
```

## Event Bus Integration

The Event Bus system integrates with WinBox for cross-window communication:

### Window Lifecycle Events

```typescript
// Backend (Main Process)
eventBus.on('window:created', (payload) => {
  console.log(`Window created: ${payload.windowId}`);
});

eventBus.on('window:closed', (payload) => {
  console.log(`Window closed: ${payload.windowId}`);
});

// Frontend (Renderer Process)
const { on } = useEventBus();

on('window:created', (payload) => {
  // Update UI with new window
  addWindowToList(payload);
});

on('window:closed', (payload) => {
  // Remove from UI
  removeWindowFromList(payload.windowId);
});
```

## State Management with Pinia

Since we don't have route-based state, we use Pinia stores:

```typescript
// stores/windows.ts
export const useWindowsStore = defineStore('windows', () => {
  const openWindows = ref<Array<{ id: string; title: string; winbox: any }>>([]);

  function addWindow(window: { id: string; title: string; winbox: any }) {
    openWindows.value.push(window);
  }

  function removeWindow(windowId: string) {
    openWindows.value = openWindows.value.filter(w => w.id !== windowId);
  }

  function focusWindow(windowId: string) {
    const win = openWindows.value.find(w => w.id === windowId);
    win?.winbox?.focus();
  }

  return { openWindows, addWindow, removeWindow, focusWindow };
});
```

## Best Practices

### 1. Window Factory Pattern

Always use the WindowFactory for creating windows:

```typescript
// ✅ Good
const winbox = WindowFactory.createWindow('Title');

// ❌ Avoid
const winbox = new WinBox({ title: 'Title' });
```

### 2. Event-based Communication

Use the Event Bus for cross-window communication:

```typescript
// ✅ Good - decoupled
eventBus.emit('window:update', { data });

// ❌ Avoid - tight coupling
winbox1.someMethod(winbox2);
```

### 3. Cleanup on Close

Always handle window close events:

```typescript
winbox.onclose = () => {
  eventBus.emit('window:closed', { windowId: winbox.id });
  cleanupResources();
};
```

### 4. Window State Persistence

Save window state for restoration:

```typescript
winbox.onresize = (w, h) => {
  localStorage.setItem('window-size', JSON.stringify({ w, h }));
};

winbox.onmove = (x, y) => {
  localStorage.setItem('window-pos', JSON.stringify({ x, y }));
};
```

## Migration from Vue Router

If migrating from Vue Router:

1. **Replace router.push()** with WindowFactory.createWindow()
2. **Replace route params** with window payload/options
3. **Replace route state** with Pinia stores
4. **Replace navigation guards** with window onclose/onfocus handlers
5. **Replace router-link** with click handlers that create windows

## Files Structure

```
src/frontend/
├── services/
│   └── window-factory.ts      # WinBox window creation
├── stores/
│   └── windows.ts             # Window state management
├── events/
│   └── useEventBus.ts         # Event bus composables
└── components/
    └── App.vue                # Main dashboard with window list
```

## Dependencies

```json
{
  "dependencies": {
    "winbox": "^0.2.82",
    "pinia": "^3.0.1",
    "vue": "^3.5.27"
  }
}
```

Note: `vue-router` has been removed as it's not needed with WinBox.

## Resources

- [WinBox Documentation](https://github.com/nextapps-de/winbox)
- [Event Bus Documentation](./docs/EVENT_BUS.md)
- [Project Structure](./STRUCTURE.md)
