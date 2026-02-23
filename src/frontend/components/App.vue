<template>
  <div class="App">
    <!-- Main App Content -->
    <button
      class="sidebar-toggle"
      type="button"
      aria-label="Toggle sidebar"
      :aria-expanded="sidebarVisible ? 'true' : 'false'"
      @click="toggleSidebar"
    >
      Menu
    </button>

    <button
      class="sidebar-backdrop"
      type="button"
      aria-label="Close sidebar"
      :class="{ 'is-visible': sidebarVisible }"
      @click="closeSidebar"
    ></button>

    <aside class="App-sidebar" :class="{ 'is-open': sidebarVisible }">
      <div class="sidebar-inner">
        <button
          class="sidebar-item sidebar-current"
          type="button"
          :disabled="!currentCard"
          @click="openCurrentCard"
        >
          <span class="sidebar-item-label">
            {{ currentCard ? currentCard.title : 'Select a card' }}
          </span>
          <span class="sidebar-item-meta">Current Card</span>
        </button>

        <button class="sidebar-item sidebar-home" type="button" @click="focusHome">
          HOME
        </button>

        <div class="sidebar-section">
          <p class="sidebar-section-title">Open Windows</p>
          <button
            v-for="win in openWindows"
            :key="win.id"
            class="sidebar-item sidebar-window"
            type="button"
            @click="focusWindow(win)"
          >
            <span class="sidebar-item-label">{{ win.title }}</span>
          </button>
          <p v-if="openWindows.length === 0" class="sidebar-empty">No windows open</p>
        </div>
      </div>
    </aside>

    <main class="App-main-no-navbar">
      <header class="App-header">
        <p class="App-eyebrow">Electron Integration Studio</p>
        <h1 class="App-title">Explore the building blocks behind the demos.</h1>
        <p class="App-subtitle">
          Search, filter, and open windows to inspect integrations in detail.
        </p>
      </header>

      <div class="search-container-no-navbar">
        <input
          type="text"
          class="search-input"
          placeholder="Search integration demos..."
          v-model="searchTerm"
          ref="searchInputRef"
        />

        <div class="filter-tabs">
          <button
            v-for="category in filterCategories"
            :key="category.id"
            class="filter-tab"
            :class="{ active: selectedCategory === category.id }"
            @click="selectedCategory = category.id"
          >
            <span class="filter-tab-label">{{ category.label }}</span>
            <span class="filter-tab-count">{{ getCategoryCount(category.id) }}</span>
          </button>
        </div>

        <div class="cards-list">
          <div
            v-for="(card, index) in filteredCards"
            :key="card.id || index"
            class="simple-card"
            @click="handleCardClick(card)"
          >
            <h3 class="simple-card-title">{{ card.title }}</h3>
          </div>

          <div v-if="filteredCards.length === 0" class="no-results">
            <p v-if="searchTerm">No matching demos found for "{{ searchTerm }}"</p>
            <p v-else-if="selectedCategory !== 'all'">
              No demos in {{ getCategoryLabel(selectedCategory) }}
            </p>
            <p v-else>No demos available</p>
          </div>
        </div>
      </div>
    </main>

    <footer class="App-footer">
      <p>Electron.js Integration Demos - Click on any card to explore</p>
    </footer>

    <!-- DevTools Panel -->
    <DevToolsPanel ref="devToolsRef" />
  </div>
</template>

<script setup lang="ts">
import type { Ref } from 'vue';
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import '../styles/App.css';
import { filterCategories, type MenuItem, menuData } from '../../shared/constants';
import { WindowFactory, setSidebarWidth } from '../services/window-factory';
import DevToolsPanel from './DevToolsPanel.vue';
import { useDevTools } from '../composables/useDevTools';

// Initialize DevTools composable
const { info, trackEvent, trackComponent } = useDevTools();

// DevTools reference
const devToolsRef = ref<InstanceType<typeof DevToolsPanel> | null>(null);

interface WindowInfo {
  id: string;
  title: string;
  winbox: unknown;
}

// State
const searchTerm = ref('');
const selectedCategory = ref('all');
const sidebarVisible = ref(false);
const openWindows = ref<WindowInfo[]>([]);
const currentCard = ref<MenuItem | null>(null);
const searchInputRef = ref<HTMLElement | null>(null);

// Sidebar media query
let sidebarMediaQuery: MediaQueryList | null = null;

// Watch sidebar visibility and update window factory
watch(sidebarVisible, (newVal) => {
  // Update sidebar width for maximize bounds calculation
  const sidebar = document.querySelector('.App-sidebar') as HTMLElement;
  if (sidebar) {
    const width = newVal ? sidebar.offsetWidth : 0;
    setSidebarWidth(width);
    
    // Update all maximized windows
    const maximizedWindows = document.querySelectorAll('.winbox.wb-maximize');
    maximizedWindows.forEach((winboxEl) => {
      const winbox = (winboxEl as any).WinBox;
      if (winbox && winbox._maximizeBounds) {
        const viewportWidth = window.innerWidth;
        const newMaximizeX = newVal ? width : 0;
        const newMaximizeWidth = viewportWidth - newMaximizeX;
        
        winbox.resize(newMaximizeWidth, winbox._maximizeBounds.height);
        winbox.move(newMaximizeX, winbox._maximizeBounds.y);
        
        // Update stored bounds
        winbox._maximizeBounds.x = newMaximizeX;
        winbox._maximizeBounds.width = newMaximizeWidth;
      }
    });
  }
});

// Computed
const filteredCards = computed(() => {
  let filtered = menuData;

  if (selectedCategory.value !== 'all') {
    filtered = filtered.filter((card) => card.category === selectedCategory.value);
  }

  if (searchTerm.value.trim()) {
    filtered = filtered.filter((card) => {
      const titleMatch = fuzzySearch(card.title, searchTerm.value);
      const contentMatch = fuzzySearch(card.content, searchTerm.value);
      const tagsMatch = card.tags.some((tag) => fuzzySearch(tag, searchTerm.value));
      return titleMatch || contentMatch || tagsMatch;
    });
  }

  return filtered;
});

// Methods
function fuzzySearch(text: string, query: string): boolean {
  if (!query) return true;

  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  let queryIndex = 0;

  for (let i = 0; i < lowerText.length; i++) {
    if (queryIndex < lowerQuery.length && lowerText[i] === lowerQuery[queryIndex]) {
      queryIndex++;
    }
  }

  return queryIndex === lowerQuery.length;
}

function getCategoryLabel(categoryId: string): string {
  const category = filterCategories.find((cat) => cat.id === categoryId);
  return category ? category.label : categoryId;
}

function getCategoryCount(categoryId: string): number {
  if (categoryId === 'all') {
    return menuData.length;
  }
  return menuData.filter((card) => card.category === categoryId).length;
}

async function handleCardClick(card: MenuItem) {
  currentCard.value = card;

  const windowId = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const winbox = WindowFactory.createWindow(card.title, null, {
    onclose: () => {
      removeWindow(windowId);
    },
  });

  openWindows.value = [
    ...openWindows.value,
    {
      id: windowId,
      title: card.title,
      winbox,
    },
  ];
}

function toggleSidebar() {
  sidebarVisible.value = !sidebarVisible.value;
}

function closeSidebar() {
  sidebarVisible.value = false;
}

function focusHome() {
  selectedCategory.value = 'all';
  searchTerm.value = '';
  nextTick(() => {
    searchInputRef.value?.focus();
  });
  closeSidebar();
}

function openCurrentCard() {
  if (!currentCard.value) return;
  handleCardClick(currentCard.value);
  closeSidebar();
}

function focusWindow(win: WindowInfo) {
  if (win?.winbox) {
    const winboxInstance = win.winbox as { restore?: () => void; focus?: () => void };
    if (typeof winboxInstance.restore === 'function') {
      winboxInstance.restore();
    }
    if (typeof winboxInstance.focus === 'function') {
      winboxInstance.focus();
    }
  }
  closeSidebar();
}

function removeWindow(windowId: string) {
  openWindows.value = openWindows.value.filter((win) => win.id !== windowId);
}

function syncSidebarForViewport() {
  if (!sidebarMediaQuery) return;
  sidebarVisible.value = sidebarMediaQuery.matches;
  
  // Update sidebar width after visibility change
  setTimeout(() => {
    const sidebar = document.querySelector('.App-sidebar') as HTMLElement;
    if (sidebar) {
      const width = sidebarVisible.value ? sidebar.offsetWidth : 0;
      setSidebarWidth(width);
    }
  }, 50);
}

// Lifecycle
onMounted(() => {
  if (typeof window !== 'undefined' && window.matchMedia) {
    sidebarMediaQuery = window.matchMedia('(min-width: 768px)');
    sidebarVisible.value = sidebarMediaQuery.matches;

    if (typeof sidebarMediaQuery.addEventListener === 'function') {
      sidebarMediaQuery.addEventListener('change', syncSidebarForViewport);
    } else if (typeof sidebarMediaQuery.addListener === 'function') {
      sidebarMediaQuery.addListener(syncSidebarForViewport);
    }
  }
});

onBeforeUnmount(() => {
  if (sidebarMediaQuery) {
    if (typeof sidebarMediaQuery.removeEventListener === 'function') {
      sidebarMediaQuery.removeEventListener('change', syncSidebarForViewport);
    } else if (typeof sidebarMediaQuery.removeListener === 'function') {
      sidebarMediaQuery.removeListener(syncSidebarForViewport);
    }
    sidebarMediaQuery = null;
  }
});
</script>

<style scoped>
/* Styles imported from App.css */
</style>
