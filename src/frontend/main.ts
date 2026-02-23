import { createApp } from 'vue';
import App from './components/App.vue';
import { initializeFrontendEventBus } from './events/frontend-event-bus';
import { pinia } from './stores/plugins/pinia';
import '../reset.css';
import '../index.css';
import './styles/global.css';

const app = createApp(App);

// Initialize event bus and Pinia before mounting app
initializeFrontendEventBus()
  .then(() => {
    app.use(pinia);
    app.mount('#root');
  })
  .catch((error) => {
    console.error('Failed to initialize event bus:', error);
    app.use(pinia);
    app.mount('#root');
  });
