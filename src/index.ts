import type { App } from 'vue';
import BookFlip from './components/BookFlip.vue';
import { useBookFlip } from './composables/useBookFlip';

export { BookFlip, useBookFlip };
export * from './types';

export default {
  install(app: App) {
    app.component('BookFlip', BookFlip);
  },
};
