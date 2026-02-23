import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export interface LogEntry {
  id: string;
  timestamp: number;
  level: 'info' | 'warn' | 'error' | 'debug';
  source: 'backend' | 'frontend' | 'ipc' | 'system';
  message: string;
  data?: unknown;
}

export interface IPCMessage {
  id: string;
  timestamp: number;
  channel: string;
  direction: 'send' | 'receive';
  payload: unknown;
  success?: boolean;
  error?: string;
}

export interface WindowInfo {
  id: number;
  title: string;
  type: 'main' | 'child';
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  isFocused: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
}

export interface SystemInfo {
  platform: string;
  arch: string;
  nodeVersion: string;
  chromeVersion: string;
  electronVersion: string;
  appVersion: string;
  appName: string;
  memoryUsage?: {
    rss: number;
    heapTotal: number;
    heapUsed: number;
    external: number;
  };
  cpuUsage?: {
    percent: number;
  };
}

export interface DevToolsState {
  // UI State
  isOpen: boolean;
  activeTab: string;
  panelHeight: number;
  
  // Data
  logs: LogEntry[];
  ipcMessages: IPCMessage[];
  windows: WindowInfo[];
  systemInfo: SystemInfo | null;
  settings: Record<string, unknown>;
  events: Array<{ type: string; payload: unknown; timestamp: number }>;
  
  // Filters
  logFilter: {
    levels: string[];
    sources: string[];
    search: string;
  };
  ipcFilter: {
    direction: 'all' | 'send' | 'receive';
    search: string;
  };
  
  // Auto-scroll
  autoScrollLogs: boolean;
  autoScrollIpc: boolean;
}

const DEFAULT_PANEL_HEIGHT = 300;
const MAX_LOGS = 500;
const MAX_IPC_MESSAGES = 200;

export const useDevToolsStore = defineStore('devTools', () => {
  // UI State
  const isOpen = ref(false);
  const activeTab = ref('logs');
  const panelHeight = ref(DEFAULT_PANEL_HEIGHT);
  
  // Data
  const logs = ref<LogEntry[]>([]);
  const ipcMessages = ref<IPCMessage[]>([]);
  const windows = ref<WindowInfo[]>([]);
  const systemInfo = ref<SystemInfo | null>(null);
  const settings = ref<Record<string, unknown>>({});
  const events = ref<Array<{ type: string; payload: unknown; timestamp: number }>>([]);
  
  // Filters
  const logFilter = ref({
    levels: ['info', 'warn', 'error', 'debug'],
    sources: ['backend', 'frontend', 'ipc', 'system'],
    search: '',
  });
  
  const ipcFilter = ref({
    direction: 'all' as 'all' | 'send' | 'receive',
    search: '',
  });
  
  // Auto-scroll
  const autoScrollLogs = ref(true);
  const autoScrollIpc = ref(true);
  
  // Computed
  const filteredLogs = computed(() => {
    return logs.value.filter((log) => {
      const matchesLevel = logFilter.value.levels.includes(log.level);
      const matchesSource = logFilter.value.sources.includes(log.source);
      const matchesSearch = logFilter.value.search === '' ||
        log.message.toLowerCase().includes(logFilter.value.search.toLowerCase()) ||
        JSON.stringify(log.data).toLowerCase().includes(logFilter.value.search.toLowerCase());
      
      return matchesLevel && matchesSource && matchesSearch;
    }).reverse();
  });
  
  const filteredIpcMessages = computed(() => {
    return ipcMessages.value.filter((msg) => {
      const matchesDirection = ipcFilter.value.direction === 'all' || msg.direction === ipcFilter.value.direction;
      const matchesSearch = ipcFilter.value.search === '' ||
        msg.channel.toLowerCase().includes(ipcFilter.value.search.toLowerCase()) ||
        JSON.stringify(msg.payload).toLowerCase().includes(ipcFilter.value.search.toLowerCase());
      
      return matchesDirection && matchesSearch;
    }).reverse();
  });
  
  const stats = computed(() => ({
    totalLogs: logs.value.length,
    totalIpcMessages: ipcMessages.value.length,
    totalWindows: windows.value.length,
    errorCount: logs.value.filter(l => l.level === 'error').length,
    warnCount: logs.value.filter(l => l.level === 'warn').length,
  }));
  
  // Actions
  function togglePanel() {
    isOpen.value = !isOpen.value;
  }
  
  function openPanel() {
    isOpen.value = true;
  }
  
  function closePanel() {
    isOpen.value = false;
  }
  
  function setActiveTab(tab: string) {
    activeTab.value = tab;
  }
  
  function setPanelHeight(height: number) {
    panelHeight.value = Math.max(150, Math.min(600, height));
  }
  
  function addLog(entry: Omit<LogEntry, 'id' | 'timestamp'>) {
    const log: LogEntry = {
      ...entry,
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      timestamp: Date.now(),
    };
    
    logs.value.push(log);
    
    // Limit log size
    if (logs.value.length > MAX_LOGS) {
      logs.value = logs.value.slice(-MAX_LOGS);
    }
  }
  
  function addIpcMessage(message: Omit<IPCMessage, 'id' | 'timestamp'>) {
    const msg: IPCMessage = {
      ...message,
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      timestamp: Date.now(),
    };
    
    ipcMessages.value.push(msg);
    
    // Limit IPC messages size
    if (ipcMessages.value.length > MAX_IPC_MESSAGES) {
      ipcMessages.value = ipcMessages.value.slice(-MAX_IPC_MESSAGES);
    }
  }
  
  function addEvent(eventType: string, payload: unknown) {
    events.value.push({
      type: eventType,
      payload,
      timestamp: Date.now(),
    });
    
    // Limit events size
    if (events.value.length > 200) {
      events.value = events.value.slice(-200);
    }
  }
  
  function updateWindows(windowList: WindowInfo[]) {
    windows.value = windowList;
  }
  
  function updateSystemInfo(info: SystemInfo) {
    systemInfo.value = info;
  }
  
  function updateSettings(newSettings: Record<string, unknown>) {
    settings.value = newSettings;
  }
  
  function clearLogs() {
    logs.value = [];
  }
  
  function clearIpcMessages() {
    ipcMessages.value = [];
  }
  
  function clearEvents() {
    events.value = [];
  }
  
  function clearAll() {
    clearLogs();
    clearIpcMessages();
    clearEvents();
  }
  
  function exportData() {
    const data = {
      timestamp: new Date().toISOString(),
      logs: logs.value,
      ipcMessages: ipcMessages.value,
      events: events.value,
      systemInfo: systemInfo.value,
      windows: windows.value,
      settings: settings.value,
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `devtools-export-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
  
  // Initialize with system info
  async function initialize() {
    if (window.electronAPI) {
      try {
        const info = await window.electronAPI.getSetting('system_info');
        if (info) {
          systemInfo.value = info as SystemInfo;
        }
        
        const allSettings = await window.electronAPI.getAllSettings();
        settings.value = allSettings;
      } catch (error) {
        console.error('Failed to initialize devtools:', error);
      }
    }
  }
  
  return {
    // State
    isOpen,
    activeTab,
    panelHeight,
    logs,
    ipcMessages,
    windows,
    systemInfo,
    settings,
    events,
    logFilter,
    ipcFilter,
    autoScrollLogs,
    autoScrollIpc,
    
    // Computed
    filteredLogs,
    filteredIpcMessages,
    stats,
    
    // Actions
    togglePanel,
    openPanel,
    closePanel,
    setActiveTab,
    setPanelHeight,
    addLog,
    addIpcMessage,
    addEvent,
    updateWindows,
    updateSystemInfo,
    updateSettings,
    clearLogs,
    clearIpcMessages,
    clearEvents,
    clearAll,
    exportData,
    initialize,
  };
});
