import { ref, computed, onMounted, onUnmounted } from 'vue';
import type { BookPage, BookFlipOptions } from '../types';

export function useBookFlip(
  pages: BookPage[],
  options: BookFlipOptions = {}
) {
  const currentPage = ref(0);
  const isFlipping = ref(false);
  const isDragging = ref(false);
  const dragStartX = ref(0);
  const dragProgress = ref(0);

  const defaultOptions: Required<BookFlipOptions> = {
    width: 800,
    height: 600,
    perspective: 2000,
    duration: 800,
    easing: 'cubic-bezier(0.645, 0.045, 0.355, 1)',
    shadow: true,
    thickness: 2,
    autoPlay: false,
    autoPlayInterval: 3000,
    rtl: false,
  };

  const config = computed(() => ({ ...defaultOptions, ...options }));

  const canGoNext = computed(() => currentPage.value < pages.length);
  const canGoPrev = computed(() => currentPage.value > 0);
  const progress = computed(() =>
    pages.length > 0 ? (currentPage.value / pages.length) * 100 : 0
  );

  let autoPlayTimer: number | null = null;

  const nextPage = () => {
    if (canGoNext.value && !isFlipping.value) {
      isFlipping.value = true;
      currentPage.value++;
      setTimeout(() => {
        isFlipping.value = false;
      }, config.value.duration);
    }
  };

  const prevPage = () => {
    if (canGoPrev.value && !isFlipping.value) {
      isFlipping.value = true;
      currentPage.value--;
      setTimeout(() => {
        isFlipping.value = false;
      }, config.value.duration);
    }
  };

  const goToPage = (page: number) => {
    if (page >= 0 && page <= pages.length && !isFlipping.value) {
      isFlipping.value = true;
      currentPage.value = page;
      setTimeout(() => {
        isFlipping.value = false;
      }, config.value.duration);
    }
  };

  const handleDragStart = (e: MouseEvent | TouchEvent) => {
    if (isFlipping.value) return;
    isDragging.value = true;
    dragStartX.value = 'touches' in e ? e.touches[0].clientX : e.clientX;
  };

  const handleDragMove = (e: MouseEvent | TouchEvent) => {
    if (!isDragging.value) return;
    const currentX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const diff = currentX - dragStartX.value;
    const pageWidth = config.value.width / 2;
    dragProgress.value = Math.max(-1, Math.min(1, diff / pageWidth));
  };

  const handleDragEnd = () => {
    if (!isDragging.value) return;
    isDragging.value = false;

    if (dragProgress.value < -0.3) {
      nextPage();
    } else if (dragProgress.value > 0.3) {
      prevPage();
    }

    dragProgress.value = 0;
  };

  const startAutoPlay = () => {
    if (!config.value.autoPlay) return;
    autoPlayTimer = window.setInterval(() => {
      if (canGoNext.value) {
        nextPage();
      } else {
        goToPage(0);
      }
    }, config.value.autoPlayInterval);
  };

  const stopAutoPlay = () => {
    if (autoPlayTimer) {
      clearInterval(autoPlayTimer);
      autoPlayTimer = null;
    }
  };

  onMounted(() => {
    if (config.value.autoPlay) {
      startAutoPlay();
    }
  });

  onUnmounted(() => {
    stopAutoPlay();
  });

  return {
    currentPage,
    isFlipping,
    isDragging,
    dragProgress,
    canGoNext,
    canGoPrev,
    progress,
    config,
    nextPage,
    prevPage,
    goToPage,
    handleDragStart,
    handleDragMove,
    handleDragEnd,
    startAutoPlay,
    stopAutoPlay,
  };
}
