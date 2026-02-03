<template>
  <div class="App">
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
          ref="searchInput"
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
            @click="handleCardClick(card, index)"
          >
            <h3 class="simple-card-title">
              {{ card.title }}
            </h3>
          </div>
          <div v-if="filteredCards.length === 0" class="no-results">
            <p v-if="searchTerm">No matching demos found for "{{ searchTerm }}"</p>
            <p v-else-if="selectedCategory !== 'all'">No demos in {{ getCategoryLabel(selectedCategory) }}</p>
            <p v-else>No demos available</p>
          </div>
        </div>
      </div>
    </main>
    <footer class="App-footer">
      <p>Electron.js Integration Demos - Click on any card to explore</p>
    </footer>
  </div>
</template>

<script>
import '../styles/App.css';
import { filterCategories, menuData } from '../../shared/constants';
import {
  ElectronArchitectureWindow,
  ElectronDevelopmentWindow,
  ElectronIntroWindow,
  ElectronNativeAPIsWindow,
  ElectronPackagingWindow,
  ElectronPerformanceWindow,
  ElectronSecurityWindow,
  ElectronVersionsWindow,
} from '../services';

export default {
  name: 'App',
  data() {
    const isDesktop =
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(min-width: 768px)').matches;
    return {
      searchTerm: '',
      selectedCategory: 'all',
      filterCategories,
      sidebarVisible: isDesktop,
      openWindows: [],
      currentCard: null,
      sidebarMediaQuery: null,
    };
  },
  computed: {
    filteredCards() {
      let filtered = menuData;

      if (this.selectedCategory !== 'all') {
        filtered = filtered.filter((card) => card.category === this.selectedCategory);
      }

      if (this.searchTerm.trim()) {
        filtered = filtered.filter((card, _index) => {
          const titleMatch = this.fuzzySearch(card.title, this.searchTerm);
          const contentMatch = this.fuzzySearch(card.content, this.searchTerm);
          const tagsMatch = card.tags.some((tag) => this.fuzzySearch(tag, this.searchTerm));
          return titleMatch || contentMatch || tagsMatch;
        });
      }

      return filtered;
    },
  },
  methods: {
    fuzzySearch(text, query) {
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
    },

    getCategoryLabel(categoryId) {
      const category = this.filterCategories.find((cat) => cat.id === categoryId);
      return category ? category.label : categoryId;
    },

    getCategoryCount(categoryId) {
      if (categoryId === 'all') {
        return menuData.length;
      }
      return menuData.filter((card) => card.category === categoryId).length;
    },

    handleCardClick(card, _index) {
      const { title } = card;
      this.currentCard = card;

      // Use generic window creation for all cards
      import('../services/window-factory').then(({ WindowFactory }) => {
        const windowId = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
        const winbox = WindowFactory.createWindow(title, null, {
          onclose: () => {
            this.removeWindow(windowId);
          },
        });
        this.openWindows = [
          ...this.openWindows,
          {
            id: windowId,
            title,
            winbox,
          },
        ];
      });
    },

    toggleSidebar() {
      this.sidebarVisible = !this.sidebarVisible;
    },

    closeSidebar() {
      this.sidebarVisible = false;
    },

    focusHome() {
      this.selectedCategory = 'all';
      this.searchTerm = '';
      this.$nextTick(() => {
        if (this.$refs.searchInput) {
          this.$refs.searchInput.focus();
        }
      });
      this.closeSidebar();
    },

    openCurrentCard() {
      if (!this.currentCard) return;
      this.handleCardClick(this.currentCard, 0);
      this.closeSidebar();
    },

    focusWindow(win) {
      if (win?.winbox) {
        if (typeof win.winbox.restore === 'function') {
          win.winbox.restore();
        }
        if (typeof win.winbox.focus === 'function') {
          win.winbox.focus();
        }
      }
      this.closeSidebar();
    },

    removeWindow(windowId) {
      this.openWindows = this.openWindows.filter((win) => win.id !== windowId);
    },

    syncSidebarForViewport() {
      if (!this.sidebarMediaQuery) return;
      this.sidebarVisible = this.sidebarMediaQuery.matches;
    },
  },
  mounted() {
    if (typeof window !== 'undefined' && window.matchMedia) {
      this.sidebarMediaQuery = window.matchMedia('(min-width: 768px)');
      this.sidebarVisible = this.sidebarMediaQuery.matches;
      if (typeof this.sidebarMediaQuery.addEventListener === 'function') {
        this.sidebarMediaQuery.addEventListener('change', this.syncSidebarForViewport);
      } else if (typeof this.sidebarMediaQuery.addListener === 'function') {
        this.sidebarMediaQuery.addListener(this.syncSidebarForViewport);
      }
    }
  },
  beforeUnmount() {
    if (this.sidebarMediaQuery) {
      if (typeof this.sidebarMediaQuery.removeEventListener === 'function') {
        this.sidebarMediaQuery.removeEventListener('change', this.syncSidebarForViewport);
      } else if (typeof this.sidebarMediaQuery.removeListener === 'function') {
        this.sidebarMediaQuery.removeListener(this.syncSidebarForViewport);
      }
    }
  },
};
</script>

<style scoped>
/* Styles will be imported from the existing App.css */
</style>
