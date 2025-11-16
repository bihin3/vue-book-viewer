import type { App } from 'vue';
import BookFlip from './components/BookFlip.vue';
import AnimationMenu from './components/AnimationMenu.vue';
import { useBookFlip } from './composables/useBookFlip';
import { useImagePreload } from './composables/useImagePreload';

export { BookFlip, AnimationMenu, useBookFlip, useImagePreload };
export * from './types';

export default {
  install(app: App) {
    app.component('BookFlip', BookFlip);
  },
};
