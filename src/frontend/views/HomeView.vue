<template>
  <div class="home-view">
    <header class="home-header">
      <p class="home-eyebrow">Electron Integration Studio</p>
      <h1 class="home-title">Explore the building blocks behind the demos.</h1>
      <p class="home-subtitle">
        Search, filter, and open windows to inspect integrations in detail.
      </p>
    </header>

    <div class="search-container">
      <input
        type="text"
        class="search-input"
        placeholder="Search integration demos..."
        :value="searchTerm"
        @input="handleSearch"
      />
      
      <div class="filter-tabs">
        <button
          v-for="category in filterCategories"
          :key="category.id"
          class="filter-tab"
          :class="{ active: selectedCategory === category.id }"
          @click="setSelectedCategory(category.id)"
        >
          <span class="filter-tab-label">{{ category.label }}</span>
          <span class="filter-tab-count">{{ getCategoryCount(category.id) }}</span>
        </button>
      </div>

      <div class="cards-list">
        <div
          v-for="card in filteredCards"
          :key="card.id"
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

    <footer class="home-footer">
      <p>Electron.js Integration Demos - Click on any card to explore</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useAppStore } from '../stores/app';
import { filterCategories, menuData, type MenuItem } from '../../shared/constants';
import { WindowFactory } from '../services/window-factory';

const appStore = useAppStore();

const searchTerm = computed(() => appStore.searchTerm);
const selectedCategory = computed(() => appStore.selectedCategory);

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

function handleSearch(event: Event) {
  const target = event.target as HTMLInputElement;
  appStore.setSearchTerm(target.value);
}

function setSelectedCategory(categoryId: string) {
  appStore.setSelectedCategory(categoryId);
}

function handleCardClick(card: MenuItem) {
  appStore.setCurrentCard(card);

  const windowId = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const winbox = WindowFactory.createWindow(card.title, null, {
    onclose: () => {
      appStore.removeWindow(windowId);
    },
  });

  appStore.addWindow({
    id: windowId,
    title: card.title,
    winbox,
  });
}
</script>

<style scoped>
.home-view {
  display: flex;
  flex-direction: column;
  min-height: 100%;
}

.home-header {
  text-align: center;
  padding: 2rem;
}

.home-eyebrow {
  font-size: 0.875rem;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.5rem;
}

.home-title {
  font-size: 2rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 0.5rem;
}

.home-subtitle {
  font-size: 1rem;
  color: #6b7280;
  max-width: 600px;
  margin: 0 auto;
}

.search-container {
  flex: 1;
  padding: 1rem 2rem;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
}

.filter-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.filter-tab {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
  border-radius: 9999px;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-tab:hover {
  background: #e5e7eb;
}

.filter-tab.active {
  background: #3b82f6;
  border-color: #3b82f6;
  color: white;
}

.filter-tab-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.25rem;
  height: 1.25rem;
  padding: 0 0.25rem;
  font-size: 0.75rem;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 9999px;
}

.filter-tab.active .filter-tab-count {
  background: rgba(255, 255, 255, 0.2);
}

.cards-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
}

.simple-card {
  padding: 1rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.simple-card:hover {
  border-color: #3b82f6;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.simple-card-title {
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.no-results {
  grid-column: 1 / -1;
  text-align: center;
  padding: 3rem;
  color: #6b7280;
}

.home-footer {
  padding: 1rem 2rem;
  text-align: center;
  color: #6b7280;
  font-size: 0.875rem;
  border-top: 1px solid #e5e7eb;
}
</style>
