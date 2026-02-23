import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

export interface WindowInfo {
  id: string;
  title: string;
  winbox: unknown;
}

export interface CardInfo {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
}

/**
 * Store for managing application UI state
 */
export const useAppStore = defineStore('app', () => {
  // State
  const sidebarVisible = ref(false);
  const currentCard = ref<CardInfo | null>(null);
  const openWindows = ref<WindowInfo[]>([]);
  const searchTerm = ref('');
  const selectedCategory = ref('all');

  // Getters
  const hasOpenWindows = computed(() => openWindows.value.length > 0);

  const currentCardTitle = computed(() =>
    currentCard.value ? currentCard.value.title : 'Select a card'
  );

  // Actions
  function toggleSidebar() {
    sidebarVisible.value = !sidebarVisible.value;
  }

  function closeSidebar() {
    sidebarVisible.value = false;
  }

  function openSidebar() {
    sidebarVisible.value = true;
  }

  function setCurrentCard(card: CardInfo | null) {
    currentCard.value = card;
  }

  function addWindow(window: WindowInfo) {
    openWindows.value.push(window);
  }

  function removeWindow(windowId: string) {
    openWindows.value = openWindows.value.filter((win) => win.id !== windowId);
  }

  function clearWindows() {
    openWindows.value = [];
  }

  function setSearchTerm(term: string) {
    searchTerm.value = term;
  }

  function setSelectedCategory(category: string) {
    selectedCategory.value = category;
  }

  function resetFilters() {
    searchTerm.value = '';
    selectedCategory.value = 'all';
  }

  return {
    // State
    sidebarVisible,
    currentCard,
    openWindows,
    searchTerm,
    selectedCategory,
    // Getters
    hasOpenWindows,
    currentCardTitle,
    // Actions
    toggleSidebar,
    closeSidebar,
    openSidebar,
    setCurrentCard,
    addWindow,
    removeWindow,
    clearWindows,
    setSearchTerm,
    setSelectedCategory,
    resetFilters,
  };
});
