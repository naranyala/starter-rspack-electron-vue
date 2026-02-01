<template>
  <div class="App">
    <main class="App-main-no-navbar">
      <div class="search-container-no-navbar">
        <input
          type="text"
          class="search-input"
          placeholder="Search integration demos..."
          v-model="searchTerm"
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
    return {
      searchTerm: '',
      selectedCategory: 'all',
      filterCategories,
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
      const { id, title } = card;

      // Use generic window creation for all cards
      import('../services/window-factory').then(({ WindowFactory }) => {
        WindowFactory.createWindow(title);
      });
    },
  },
};
</script>

<style scoped>
/* Styles will be imported from the existing App.css */
</style>