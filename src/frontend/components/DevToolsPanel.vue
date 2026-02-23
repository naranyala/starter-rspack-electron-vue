<template>
  <div class="devtools" :class="{ 'devtools--open': isOpen }">
    <!-- DevTools Toggle Button -->
    <button class="devtools__toggle" @click="togglePanel" :title="isOpen ? 'Close DevTools' : 'Open DevTools'">
      <svg v-if="!isOpen" class="devtools__toggle-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="4 7 4 4 20 4 20 7" />
        <line x1="9" y1="20" x2="15" y2="20" />
        <line x1="12" y1="4" x2="12" y2="20" />
      </svg>
      <svg v-else class="devtools__toggle-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="7 17 7 20 17 20 17 17" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="7" y1="4" x2="17" y2="4" />
      </svg>
    </button>

    <!-- DevTools Panel -->
    <div class="devtools__panel" :style="{ height: panelHeight + 'px' }">
      <!-- Panel Header -->
      <div class="devtools__header">
        <div class="devtools__tabs">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            class="devtools__tab"
            :class="{ 'devtools__tab--active': activeTab === tab.id }"
            @click="setActiveTab(tab.id)"
          >
            <span class="devtools__tab-icon">{{ tab.icon }}</span>
            <span class="devtools__tab-label">{{ tab.label }}</span>
            <span v-if="tab.count" class="devtools__tab-count">{{ tab.count }}</span>
          </button>
        </div>

        <div class="devtools__actions">
          <button class="devtools__action" @click="clearCurrentTab" title="Clear">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          </button>
          <button class="devtools__action" @click="exportData" title="Export">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
          </button>
          <button class="devtools__action" @click="closePanel" title="Close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <!-- Resize Handle -->
        <div
          class="devtools__resize"
          @mousedown="startResize"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="4" y1="12" x2="20" y2="12" />
            <line x1="4" y1="8" x2="20" y2="8" />
            <line x1="4" y1="16" x2="20" y2="16" />
          </svg>
        </div>
      </div>

      <!-- Panel Content -->
      <div class="devtools__content">
        <!-- Logs Tab -->
        <div v-if="activeTab === 'logs'" class="devtools__logs">
          <div class="devtools__filters">
            <input
              v-model="logFilter.search"
              class="devtools__search"
              placeholder="Search logs..."
              type="text"
            />
            <div class="devtools__filter-group">
              <label v-for="level in ['info', 'warn', 'error', 'debug']" :key="level" class="devtools__filter-label">
                <input
                  type="checkbox"
                  :checked="logFilter.levels.includes(level)"
                  @change="toggleLogLevel(level)"
                />
                <span class="devtools__level" :class="'devtools__level--' + level">{{ level.toUpperCase() }}</span>
              </label>
            </div>
          </div>
          <div class="devtools__log-list" ref="logListRef">
            <div
              v-for="log in filteredLogs"
              :key="log.id"
              class="devtools__log-entry"
              :class="'devtools__log-entry--' + log.level"
            >
              <span class="devtools__log-time">{{ formatTime(log.timestamp) }}</span>
              <span class="devtools__log-level" :class="'devtools__level--' + log.level">{{ log.level.toUpperCase() }}</span>
              <span class="devtools__log-source">{{ log.source }}</span>
              <span class="devtools__log-message">{{ log.message }}</span>
              <pre v-if="log.data" class="devtools__log-data">{{ JSON.stringify(log.data, null, 2) }}</pre>
            </div>
            <div v-if="filteredLogs.length === 0" class="devtools__empty">
              No logs to display
            </div>
          </div>
        </div>

        <!-- IPC Tab -->
        <div v-if="activeTab === 'ipc'" class="devtools__ipc">
          <div class="devtools__filters">
            <input
              v-model="ipcFilter.search"
              class="devtools__search"
              placeholder="Search IPC messages..."
              type="text"
            />
            <select v-model="ipcFilter.direction" class="devtools__select">
              <option value="all">All Directions</option>
              <option value="send">Send Only</option>
              <option value="receive">Receive Only</option>
            </select>
          </div>
          <div class="devtools__ipc-list" ref="ipcListRef">
            <div
              v-for="msg in filteredIpcMessages"
              :key="msg.id"
              class="devtools__ipc-entry"
              :class="'devtools__ipc-entry--' + msg.direction"
            >
              <span class="devtools__ipc-time">{{ formatTime(msg.timestamp) }}</span>
              <span class="devtools__ipc-direction" :class="'devtools__ipc-direction--' + msg.direction">
                {{ msg.direction === 'send' ? '→' : '←' }}
              </span>
              <span class="devtools__ipc-channel">{{ msg.channel }}</span>
              <pre class="devtools__ipc-payload">{{ JSON.stringify(msg.payload, null, 2) }}</pre>
              <span v-if="msg.error" class="devtools__ipc-error">{{ msg.error }}</span>
            </div>
            <div v-if="filteredIpcMessages.length === 0" class="devtools__empty">
              No IPC messages to display
            </div>
          </div>
        </div>

        <!-- Events Tab -->
        <div v-if="activeTab === 'events'" class="devtools__events">
          <div class="devtools__events-list">
            <div
              v-for="(event, index) in events.slice().reverse()"
              :key="index"
              class="devtools__event-entry"
            >
              <span class="devtools__event-time">{{ formatTime(event.timestamp) }}</span>
              <span class="devtools__event-type">{{ event.type }}</span>
              <pre class="devtools__event-payload">{{ JSON.stringify(event.payload, null, 2) }}</pre>
            </div>
            <div v-if="events.length === 0" class="devtools__empty">
              No events to display
            </div>
          </div>
        </div>

        <!-- Windows Tab -->
        <div v-if="activeTab === 'windows'" class="devtools__windows">
          <div class="devtools__windows-grid">
            <div
              v-for="win in windows"
              :key="win.id"
              class="devtools__window-card"
              :class="{ 'devtools__window-card--focused': win.isFocused }"
            >
              <div class="devtools__window-header">
                <span class="devtools__window-title">{{ win.title }}</span>
                <span class="devtools__window-type">{{ win.type }}</span>
              </div>
              <div class="devtools__window-info">
                <div class="devtools__window-property">
                  <span class="devtools__property-name">ID:</span>
                  <span class="devtools__property-value">{{ win.id }}</span>
                </div>
                <div class="devtools__window-property">
                  <span class="devtools__property-name">Position:</span>
                  <span class="devtools__property-value">{{ win.bounds.x }}, {{ win.bounds.y }}</span>
                </div>
                <div class="devtools__window-property">
                  <span class="devtools__property-name">Size:</span>
                  <span class="devtools__property-value">{{ win.bounds.width }} x {{ win.bounds.height }}</span>
                </div>
                <div class="devtools__window-status">
                  <span v-if="win.isFocused" class="devtools__status-badge devtools__status-badge--success">Focused</span>
                  <span v-if="win.isMinimized" class="devtools__status-badge devtools__status-badge--warn">Minimized</span>
                  <span v-if="win.isMaximized" class="devtools__status-badge devtools__status-badge--info">Maximized</span>
                </div>
              </div>
            </div>
            <div v-if="windows.length === 0" class="devtools__empty">
              No windows to display
            </div>
          </div>
        </div>

        <!-- System Tab -->
        <div v-if="activeTab === 'system'" class="devtools__system">
          <div v-if="systemInfo" class="devtools__system-info">
            <div class="devtools__info-section">
              <h4 class="devtools__section-title">Application</h4>
              <div class="devtools__info-grid">
                <div class="devtools__info-item">
                  <span class="devtools__property-name">App Name:</span>
                  <span class="devtools__property-value">{{ systemInfo.appName }}</span>
                </div>
                <div class="devtools__info-item">
                  <span class="devtools__property-name">Version:</span>
                  <span class="devtools__property-value">{{ systemInfo.appVersion }}</span>
                </div>
                <div class="devtools__info-item">
                  <span class="devtools__property-name">Electron:</span>
                  <span class="devtools__property-value">{{ systemInfo.electronVersion }}</span>
                </div>
                <div class="devtools__info-item">
                  <span class="devtools__property-name">Chrome:</span>
                  <span class="devtools__property-value">{{ systemInfo.chromeVersion }}</span>
                </div>
                <div class="devtools__info-item">
                  <span class="devtools__property-name">Node:</span>
                  <span class="devtools__property-value">{{ systemInfo.nodeVersion }}</span>
                </div>
                <div class="devtools__info-item">
                  <span class="devtools__property-name">Platform:</span>
                  <span class="devtools__property-value">{{ systemInfo.platform }} ({{ systemInfo.arch }})</span>
                </div>
              </div>
            </div>

            <div v-if="systemInfo.memoryUsage" class="devtools__info-section">
              <h4 class="devtools__section-title">Memory Usage</h4>
              <div class="devtools__info-grid">
                <div class="devtools__info-item">
                  <span class="devtools__property-name">RSS:</span>
                  <span class="devtools__property-value">{{ formatBytes(systemInfo.memoryUsage.rss) }}</span>
                </div>
                <div class="devtools__info-item">
                  <span class="devtools__property-name">Heap Total:</span>
                  <span class="devtools__property-value">{{ formatBytes(systemInfo.memoryUsage.heapTotal) }}</span>
                </div>
                <div class="devtools__info-item">
                  <span class="devtools__property-name">Heap Used:</span>
                  <span class="devtools__property-value">{{ formatBytes(systemInfo.memoryUsage.heapUsed) }}</span>
                </div>
                <div class="devtools__info-item">
                  <span class="devtools__property-name">External:</span>
                  <span class="devtools__property-value">{{ formatBytes(systemInfo.memoryUsage.external) }}</span>
                </div>
              </div>
            </div>

            <div class="devtools__info-section">
              <h4 class="devtools__section-title">Statistics</h4>
              <div class="devtools__stats-grid">
                <div class="devtools__stat-card">
                  <span class="devtools__stat-value">{{ stats.totalLogs }}</span>
                  <span class="devtools__stat-label">Total Logs</span>
                </div>
                <div class="devtools__stat-card">
                  <span class="devtools__stat-value">{{ stats.totalIpcMessages }}</span>
                  <span class="devtools__stat-label">IPC Messages</span>
                </div>
                <div class="devtools__stat-card">
                  <span class="devtools__stat-value devtools__stat-value--error">{{ stats.errorCount }}</span>
                  <span class="devtools__stat-label">Errors</span>
                </div>
                <div class="devtools__stat-card">
                  <span class="devtools__stat-value devtools__stat-value--warn">{{ stats.warnCount }}</span>
                  <span class="devtools__stat-label">Warnings</span>
                </div>
                <div class="devtools__stat-card">
                  <span class="devtools__stat-value">{{ stats.totalWindows }}</span>
                  <span class="devtools__stat-label">Windows</span>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="devtools__empty">
            Loading system information...
          </div>
        </div>

        <!-- Settings Tab -->
        <div v-if="activeTab === 'settings'" class="devtools__settings">
          <div class="devtools__settings-list">
            <div
              v-for="[key, value] in Object.entries(settings)"
              :key="key"
              class="devtools__setting-item"
            >
              <span class="devtools__setting-key">{{ key }}</span>
              <pre class="devtools__setting-value">{{ JSON.stringify(value, null, 2) }}</pre>
            </div>
            <div v-if="Object.keys(settings).length === 0" class="devtools__empty">
              No settings to display
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, nextTick, onMounted, onUnmounted } from 'vue';
import { useDevToolsStore } from '../stores/devTools';
import { storeToRefs } from 'pinia';

const store = useDevToolsStore();
const {
  isOpen,
  activeTab,
  panelHeight,
  filteredLogs,
  filteredIpcMessages,
  logs,
  ipcMessages,
  events,
  windows,
  systemInfo,
  settings,
  stats,
  logFilter,
  ipcFilter,
} = storeToRefs(store);

const {
  togglePanel,
  closePanel,
  setActiveTab,
  setPanelHeight,
  clearLogs,
  clearIpcMessages,
  clearEvents,
  exportData,
  addLog,
  addIpcMessage,
  addEvent,
} = store;

const logListRef = ref<HTMLElement | null>(null);
const ipcListRef = ref<HTMLElement | null>(null);
let isResizing = false;
let startY = 0;
let startHeight = 0;

// Tabs configuration
const tabs = computed(() => [
  { id: 'logs', label: 'Logs', icon: '📋', count: logs.value.length },
  { id: 'ipc', label: 'IPC', icon: '🔌', count: ipcMessages.value.length },
  { id: 'events', label: 'Events', icon: '⚡', count: events.value.length },
  { id: 'windows', label: 'Windows', icon: '🪟', count: windows.value.length },
  { id: 'system', label: 'System', icon: 'ℹ️', count: null },
  { id: 'settings', label: 'Settings', icon: '⚙️', count: null },
]);

// Methods
function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    fractionalSecondDigits: 3,
  });
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function toggleLogLevel(level: string) {
  const index = logFilter.value.levels.indexOf(level);
  if (index > -1) {
    logFilter.value.levels.splice(index, 1);
  } else {
    logFilter.value.levels.push(level);
  }
}

function clearCurrentTab() {
  if (activeTab.value === 'logs') clearLogs();
  else if (activeTab.value === 'ipc') clearIpcMessages();
  else if (activeTab.value === 'events') clearEvents();
  else clearLogs();
}

function startResize(event: MouseEvent) {
  isResizing = true;
  startY = event.clientY;
  startHeight = panelHeight.value;
  document.addEventListener('mousemove', onResize);
  document.addEventListener('mouseup', stopResize);
  document.body.style.cursor = 'ns-resize';
  document.body.style.userSelect = 'none';
}

function onResize(event: MouseEvent) {
  if (!isResizing) return;
  const delta = startY - event.clientY;
  const newHeight = startHeight + delta;
  setPanelHeight(newHeight);
}

function stopResize() {
  isResizing = false;
  document.removeEventListener('mousemove', onResize);
  document.removeEventListener('mouseup', stopResize);
  document.body.style.cursor = '';
  document.body.style.userSelect = '';
}

// Auto-scroll to bottom of logs
watch([filteredLogs, store.autoScrollLogs], () => {
  if (store.autoScrollLogs && logListRef.value) {
    nextTick(() => {
      logListRef.value.scrollTop = logListRef.value.scrollHeight;
    });
  }
}, { deep: true });

// Auto-scroll to bottom of IPC messages
watch([filteredIpcMessages, store.autoScrollIpc], () => {
  if (store.autoScrollIpc && ipcListRef.value) {
    nextTick(() => {
      ipcListRef.value.scrollTop = ipcListRef.value.scrollHeight;
    });
  }
}, { deep: true });

// Keyboard shortcut (Ctrl/Cmd + Shift + D)
function handleKeyDown(event: KeyboardEvent) {
  if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'D') {
    event.preventDefault();
    togglePanel();
  }
}

// Expose methods for external use
defineExpose({
  addLog,
  addIpcMessage,
  addEvent,
  togglePanel,
  openPanel: () => store.openPanel(),
  closePanel,
});

onMounted(() => {
  document.addEventListener('keydown', handleKeyDown);
  store.initialize();
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown);
});
</script>

<style scoped>
.devtools {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 9999;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
  font-size: 12px;
}

.devtools__toggle {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: #3b82f6;
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
  transition: all 0.2s;
  z-index: 10000;
}

.devtools__toggle:hover {
  background: #2563eb;
  transform: scale(1.1);
}

.devtools__toggle-icon {
  width: 20px;
  height: 20px;
}

.devtools__panel {
  background: #1e1e1e;
  color: #d4d4d4;
  border-top: 1px solid #3c3c3c;
  display: flex;
  flex-direction: column;
  transition: transform 0.2s ease;
  transform: translateY(100%);
  height: 300px;
}

.devtools--open .devtools__panel {
  transform: translateY(0);
}

.devtools__header {
  display: flex;
  align-items: center;
  background: #252526;
  border-bottom: 1px solid #3c3c3c;
  padding: 0 8px;
  height: 40px;
  flex-shrink: 0;
  position: relative;
}

.devtools__tabs {
  display: flex;
  gap: 2px;
  overflow-x: auto;
}

.devtools__tab {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: transparent;
  border: none;
  color: #969696;
  cursor: pointer;
  font-size: 12px;
  white-space: nowrap;
  transition: all 0.15s;
  border-bottom: 2px solid transparent;
}

.devtools__tab:hover {
  background: #2d2d30;
  color: #d4d4d4;
}

.devtools__tab--active {
  background: #1e1e1e;
  color: #d4d4d4;
  border-bottom-color: #3b82f6;
}

.devtools__tab-icon {
  font-size: 14px;
}

.devtools__tab-count {
  background: #3c3c3c;
  color: #969696;
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 10px;
}

.devtools__tab--active .devtools__tab-count {
  background: #3b82f6;
  color: white;
}

.devtools__actions {
  display: flex;
  gap: 4px;
  margin-left: auto;
  margin-right: 8px;
}

.devtools__action {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  color: #969696;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.15s;
}

.devtools__action:hover {
  background: #3c3c3c;
  color: #d4d4d4;
}

.devtools__action svg {
  width: 16px;
  height: 16px;
}

.devtools__resize {
  position: absolute;
  top: -6px;
  left: 0;
  right: 0;
  height: 12px;
  cursor: ns-resize;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.15s;
}

.devtools__resize:hover {
  opacity: 1;
  background: #3b82f6;
}

.devtools__resize svg {
  width: 20px;
  height: 20px;
  color: #d4d4d4;
}

.devtools__content {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.devtools__filters {
  display: flex;
  gap: 12px;
  padding: 8px 12px;
  background: #252526;
  border-bottom: 1px solid #3c3c3c;
  align-items: center;
  flex-wrap: wrap;
}

.devtools__search {
  flex: 1;
  min-width: 200px;
  padding: 6px 10px;
  background: #3c3c3c;
  border: 1px solid #3c3c3c;
  border-radius: 4px;
  color: #d4d4d4;
  font-size: 12px;
}

.devtools__search:focus {
  outline: none;
  border-color: #3b82f6;
}

.devtools__select {
  padding: 6px 10px;
  background: #3c3c3c;
  border: 1px solid #3c3c3c;
  border-radius: 4px;
  color: #d4d4d4;
  font-size: 12px;
  cursor: pointer;
}

.devtools__filter-group {
  display: flex;
  gap: 12px;
  align-items: center;
}

.devtools__filter-label {
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
}

.devtools__level {
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 10px;
  font-weight: 600;
}

.devtools__level--info { background: #3b82f6; color: white; }
.devtools__level--warn { background: #f59e0b; color: white; }
.devtools__level--error { background: #ef4444; color: white; }
.devtools__level--debug { background: #8b5cf6; color: white; }

.devtools__log-list,
.devtools__ipc-list,
.devtools__events-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.devtools__log-entry,
.devtools__ipc-entry,
.devtools__event-entry {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 8px;
  padding: 6px 8px;
  margin-bottom: 4px;
  background: #2d2d30;
  border-radius: 4px;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 11px;
}

.devtools__log-entry:hover,
.devtools__ipc-entry:hover,
.devtools__event-entry:hover {
  background: #3c3c3c;
}

.devtools__log-time,
.devtools__ipc-time,
.devtools__event-time {
  color: #6a9955;
  white-space: nowrap;
}

.devtools__log-level,
.devtools__ipc-direction {
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 10px;
  font-weight: 600;
  min-width: 50px;
  text-align: center;
}

.devtools__log-entry--info .devtools__log-level { background: #3b82f6; color: white; }
.devtools__log-entry--warn .devtools__log-level { background: #f59e0b; color: white; }
.devtools__log-entry--error .devtools__log-level { background: #ef4444; color: white; }
.devtools__log-entry--debug .devtools__log-level { background: #8b5cf6; color: white; }

.devtools__ipc-direction--send { color: #4ec9b0; }
.devtools__ipc-direction--receive { color: #ce9178; }

.devtools__log-source,
.devtools__ipc-channel,
.devtools__event-type {
  color: #4ec9b0;
  font-weight: 500;
}

.devtools__log-message {
  color: #d4d4d4;
  flex: 1;
  min-width: 200px;
}

.devtools__log-data,
.devtools__ipc-payload,
.devtools__event-payload {
  width: 100%;
  margin: 4px 0 0;
  padding: 8px;
  background: #1e1e1e;
  border-radius: 4px;
  color: #ce9178;
  font-size: 11px;
  max-height: 200px;
  overflow: auto;
}

.devtools__ipc-error {
  color: #ef4444;
  width: 100%;
}

.devtools__windows-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 12px;
  padding: 12px;
}

.devtools__window-card {
  background: #2d2d30;
  border-radius: 6px;
  padding: 12px;
  border: 1px solid #3c3c3c;
}

.devtools__window-card--focused {
  border-color: #3b82f6;
  box-shadow: 0 0 0 1px #3b82f6;
}

.devtools__window-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.devtools__window-title {
  font-weight: 600;
  color: #d4d4d4;
}

.devtools__window-type {
  color: #969696;
  font-size: 10px;
  text-transform: uppercase;
}

.devtools__window-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.devtools__window-property {
  display: flex;
  gap: 8px;
}

.devtools__property-name {
  color: #969696;
}

.devtools__property-value {
  color: #d4d4d4;
}

.devtools__window-status {
  display: flex;
  gap: 4px;
  margin-top: 4px;
}

.devtools__status-badge {
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 10px;
  font-weight: 500;
}

.devtools__status-badge--success { background: #22c55e; color: white; }
.devtools__status-badge--warn { background: #f59e0b; color: white; }
.devtools__status-badge--info { background: #3b82f6; color: white; }

.devtools__info-section {
  padding: 12px;
  border-bottom: 1px solid #3c3c3c;
}

.devtools__section-title {
  color: #d4d4d4;
  margin: 0 0 8px;
  font-size: 13px;
  font-weight: 600;
}

.devtools__info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 8px;
}

.devtools__info-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.devtools__stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 12px;
}

.devtools__stat-card {
  background: #2d2d30;
  border-radius: 6px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.devtools__stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #3b82f6;
}

.devtools__stat-value--error { color: #ef4444; }
.devtools__stat-value--warn { color: #f59e0b; }

.devtools__stat-label {
  color: #969696;
  font-size: 11px;
}

.devtools__settings-list {
  padding: 12px;
}

.devtools__setting-item {
  background: #2d2d30;
  border-radius: 4px;
  padding: 8px;
  margin-bottom: 8px;
}

.devtools__setting-key {
  color: #4ec9b0;
  font-weight: 500;
  display: block;
  margin-bottom: 4px;
}

.devtools__setting-value {
  margin: 0;
  color: #ce9178;
  font-size: 11px;
  max-height: 150px;
  overflow: auto;
}

.devtools__empty {
  padding: 40px;
  text-align: center;
  color: #969696;
}

/* Scrollbar styling */
.devtools__log-list::-webkit-scrollbar,
.devtools__ipc-list::-webkit-scrollbar,
.devtools__events-list::-webkit-scrollbar,
.devtools__setting-value::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.devtools__log-list::-webkit-scrollbar-track,
.devtools__ipc-list::-webkit-scrollbar-track,
.devtools__events-list::-webkit-scrollbar-track,
.devtools__setting-value::-webkit-scrollbar-track {
  background: #1e1e1e;
}

.devtools__log-list::-webkit-scrollbar-thumb,
.devtools__ipc-list::-webkit-scrollbar-thumb,
.devtools__events-list::-webkit-scrollbar-thumb,
.devtools__setting-value::-webkit-scrollbar-thumb {
  background: #424242;
  border-radius: 4px;
}

.devtools__log-list::-webkit-scrollbar-thumb:hover,
.devtools__ipc-list::-webkit-scrollbar-thumb:hover,
.devtools__events-list::-webkit-scrollbar-thumb:hover,
.devtools__setting-value::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>
