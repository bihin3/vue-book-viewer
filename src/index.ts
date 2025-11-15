import type { App } from 'vue';
import BookFlip from './components/BookFlip.vue';
import { useBookFlip } from './composables/useBookFlip';
import { useImagePreload } from './composables/useImagePreload';

export { BookFlip, useBookFlip, useImagePreload };
export * from './types';

export default {
  install(app: App) {
    app.component('BookFlip', BookFlip);
  },
};
