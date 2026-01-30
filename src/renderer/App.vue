<template>
  <div class="App">
    <main class="App-main-no-navbar">
      <div class="search-container-no-navbar">
        <input
          type="text"
          class="search-input"
          placeholder="Search topics..."
          v-model="searchTerm"
        />
        <div class="cards-list">
          <div
            v-for="(card, index) in filteredCards"
            :key="card.id || index"
            class="simple-card"
            @click="handleCardClick(card, index)"
          >
            <h3
              class="simple-card-title"
              v-html="processTitle(card.title, searchTerm)"
            />
          </div>
          <div v-if="filteredCards.length === 0" class="no-results">
            No matching topics found
          </div>
        </div>
      </div>
    </main>
    <footer class="App-footer">
      <p>Get started by editing <code>src/App.vue</code> and save to reload.</p>
    </footer>
  </div>
</template>

<script>
import './styles/App.css';
import { menuData } from './lib/menu-data';
import {
  ElectronArchitectureWindow,
  ElectronDevelopmentWindow,
  ElectronIntroWindow,
  ElectronNativeAPIsWindow,
  ElectronPackagingWindow,
  ElectronPerformanceWindow,
  ElectronSecurityWindow,
  ElectronVersionsWindow,
} from './use-cases';

export default {
  name: 'App',
  data() {
    return {
      searchTerm: '',
    };
  },
  computed: {
    filteredCards() {
      return menuData.filter((card, _index) => {
        const titleMatch = this.fuzzySearch(card.title, this.searchTerm).matches;
        return titleMatch;
      });
    },
  },
  methods: {
    fuzzySearch(text, query) {
      if (!query) return { matches: true, highlightedText: text };

      const _lowerText = text.toLowerCase();
      const lowerQuery = query.toLowerCase();

      let matchFound = true;
      let highlightedText = '';
      let queryIndex = 0;

      for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const lowerChar = char.toLowerCase();

        if (queryIndex < lowerQuery.length && lowerChar === lowerQuery[queryIndex]) {
          highlightedText += `<mark>${char}</mark>`;
          queryIndex++;
        } else {
          highlightedText += char;
        }
      }

      // Check if all query characters were found in sequence
      matchFound = queryIndex === lowerQuery.length;

      return { matches: matchFound, highlightedText };
    },

    processTitle(title, searchTerm) {
      const processedTitle = this.fuzzySearch(title, searchTerm);
      return processedTitle.matches ? processedTitle.highlightedText : title;
    },

    handleCardClick(card, _index) {
      const { id, title } = card;

      // Create window based on the card ID
      switch (id) {
        case 'electron-intro':
          ElectronIntroWindow.create();
          break;
        case 'electron-architecture':
          ElectronArchitectureWindow.create();
          break;
        case 'electron-security':
          ElectronSecurityWindow.create();
          break;
        case 'electron-packaging':
          ElectronPackagingWindow.create();
          break;
        case 'electron-native-apis':
          ElectronNativeAPIsWindow.create();
          break;
        case 'electron-performance':
          ElectronPerformanceWindow.create();
          break;
        case 'electron-development':
          ElectronDevelopmentWindow.create();
          break;
        case 'electron-versions':
          ElectronVersionsWindow.create();
          break;
        default:
          // Fallback to generic window creation if no specific window is defined
          import('./use-cases/window-factory').then(({ WindowFactory }) => {
            WindowFactory.createWindow(title);
          });
          break;
      }
    },
  },
};
</script>

<style scoped>
/* Styles will be imported from the existing App.css */
</style>