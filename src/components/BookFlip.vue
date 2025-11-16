<template>
  <div class="book-flip-container" ref="containerRef" :class="{ maximized: isMaximized }">
    <!-- Flip animation mode -->
    <div
      v-if="animationType === 'flip'"
      class="book-flip"
      :class="{ rtl: isRTL }"
      ref="bookRef"
      :style="bookStyle"
      @mousedown="handleDragStart"
      @mousemove="handleDragMove"
      @mouseup="handleDragEnd"
      @mouseleave="handleDragEnd"
      @touchstart="handleDragStart"
      @touchmove="handleDragMove"
      @touchend="handleDragEnd"
    >
      <!-- Left page (static background) -->
      <div
        class="page-left"
        :class="{
          clickable: canGoPrev,
          'first-page': displayedLeftPage === 0 && config.singleFirstPage
        }"
        :style="leftPageStyle"
        @click="handleLeftPageClick"
      >
        <div class="left-page-wrapper">
          <img v-if="leftPageImage" :src="leftPageImage" alt="" draggable="false" class="left-page-img">
        </div>
      </div>

      <!-- Flipping pages (right side) -->
      <div
        v-for="(_page, index) in pages"
        :key="index"
        class="page-right"
        :class="{
          flipped: index < currentPage,
          flipping: flippingPageIndex === index,
          active: index === currentPage,
          'last-page': index === currentPage && !canGoNext
        }"
        :style="getRightPageStyle(index)"
        @click="handlePageClick(index)"
      >
        <div class="page-content front">
          <slot name="page" :page="getRightPageFront(index)" :index="index * 2 + 1">
            <img :src="getRightPageFront(index)" alt="" draggable="false">
          </slot>
        </div>
        <div class="page-content back">
          <slot name="page" :page="getRightPageBack(index)" :index="index * 2 + 2">
            <img :src="getRightPageBack(index)" alt="" draggable="false">
          </slot>
        </div>
      </div>
    </div>

    <!-- Slide/None animation mode -->
    <div
      v-else
      class="book-simple"
      :class="{ rtl: isRTL, 'animation-none': animationType === 'none' }"
      ref="bookRef"
      :style="bookStyle"
    >
      <div class="simple-pages-container">
        <!-- Left page -->
        <div
          class="simple-page simple-page-left"
          :class="{ clickable: canGoPrev }"
          @click="handleLeftPageClick"
        >
          <img v-if="leftPageImage" :src="leftPageImage" alt="" draggable="false">
        </div>

        <!-- Right page -->
        <div
          class="simple-page simple-page-right"
          :class="{ clickable: canGoNext }"
          @click="canGoNext && nextPage()"
        >
          <img v-if="rightPageImage" :src="rightPageImage" alt="" draggable="false">
        </div>
      </div>
    </div>

    <div v-if="showControls" class="controls">
      <slot name="controls" :next="nextPage" :prev="prevPage" :current="currentPage" :total="pages.length" :goToFirst="goToFirstPage" :goToLast="goToLastPage">
        <div class="toolbar">
          <div class="toolbar-buttons">
            <button
              @click="goToFirstPage"
              :disabled="currentPage === 0"
              class="control-btn"
              title="最初のページ"
            >
              ⏮
            </button>
            <button
              @click="prevPage"
              :disabled="!canGoPrev"
              class="control-btn"
              title="前のページ"
            >
              ◀
            </button>
            <button
              @click="nextPage"
              :disabled="!canGoNext"
              class="control-btn"
              title="次のページ"
            >
              ▶
            </button>
            <button
              @click="goToLastPage"
              :disabled="currentPage === pages.length"
              class="control-btn"
              title="最後のページ"
            >
              ⏭
            </button>
          </div>
          <div v-if="showProgress" class="progress-bar">
            <div class="progress-fill" :style="{ width: `${progressPercent}%` }"></div>
          </div>
          <div class="page-info">
            <span class="page-indicator">{{ currentMaxPage }}/{{ totalPages }}ページ・{{ progressPercent }}%</span>
          </div>
          <button
            @click="toggleMaximize"
            class="control-btn maximize-btn"
            :title="isMaximized ? '拡大を解除' : '拡大表示'"
          >
            <svg v-if="!isMaximized" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 15L5 15M1 15L1 11M1 15L6 10M15 1L11 1M15 1L15 5M15 1L10 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
            <svg v-else width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 10L2 10M6 10L6 14M6 10L1 15M10 6L14 6M10 6L10 2M10 6L15 1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
            <span class="btn-text">{{ isMaximized ? '縮小' : '拡大' }}</span>
          </button>
          <button
            @click="toggleFullscreen"
            class="control-btn fullscreen-btn"
            :title="isFullscreen ? '全画面を解除' : '全画面表示'"
          >
            <svg v-if="!isFullscreen" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 2L2 5M2 2L5 2M14 2L14 5M14 2L11 2M2 14L2 11M2 14L5 14M14 14L14 11M14 14L11 14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
            <svg v-else width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 5L5 2M5 5L2 5M11 5L11 2M11 5L14 5M5 11L5 14M5 11L2 11M11 11L11 14M11 11L14 11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
            <span class="btn-text">{{ isFullscreen ? '解除' : '全画面' }}</span>
          </button>
          <AnimationMenu v-model="animationType" />
        </div>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, watchEffect, onMounted, onUnmounted } from 'vue';
import { useBookFlip } from '../composables/useBookFlip';
import { useImagePreload } from '../composables/useImagePreload';
import AnimationMenu from './AnimationMenu.vue';
import type { BookPage, BookFlipOptions, BookFlipEmits, AnimationType } from '../types';

interface Props {
  pages: BookPage[];
  options?: BookFlipOptions;
  showControls?: boolean;
  showProgress?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  showControls: true,
  showProgress: false,
  options: () => ({}),
});

const emit = defineEmits<BookFlipEmits>();

const containerRef = ref<HTMLElement>();
const bookRef = ref<HTMLElement>();
const displayedLeftPage = ref(0); // Delayed left page update
const isFullscreen = ref(false); // Fullscreen state
const isMaximized = ref(false); // Maximized state (within browser viewport)
const animationType = ref<AnimationType>(props.options?.animationType || 'flip');

const {
  currentPage,
  isFlipping,
  flippingPageIndex,
  canGoNext,
  canGoPrev,
  progress,
  config,
  nextPage: next,
  prevPage: prev,
  goToPage,
  handleDragStart: onDragStart,
  handleDragMove: onDragMove,
  handleDragEnd: onDragEnd,
} = useBookFlip(props.pages, props.options);

// Image preloading
const { preloadImages } = useImagePreload();

const totalPages = computed(() => props.pages.length * 2);
const isRTL = computed(() => config.value.rtl);

// Current page range for display
const currentPageRange = computed(() => {
  if (!config.value.singleFirstPage) {
    // Spread mode: show spread page numbers
    const leftPage = currentPage.value * 2 + 1;
    const rightPage = currentPage.value * 2 + 2;
    return `${leftPage}-${rightPage}`;
  } else {
    // Single page mode: first page is single, then spreads
    if (currentPage.value === 0) {
      return '1';
    }
    const leftPage = currentPage.value * 2;
    const rightPage = Math.min(currentPage.value * 2 + 1, totalPages.value);
    return `${leftPage}-${rightPage}`;
  }
});

// Current maximum page number being displayed
const currentMaxPage = computed(() => {
  if (!config.value.singleFirstPage) {
    // Spread mode
    return Math.min(currentPage.value * 2 + 2, totalPages.value);
  } else {
    // Single page mode
    if (currentPage.value === 0) {
      return 1;
    }
    return Math.min(currentPage.value * 2 + 1, totalPages.value);
  }
});

// Progress percentage based on page numbers
const progressPercent = computed(() => {
  if (totalPages.value === 0) return 0;
  if (currentMaxPage.value === 1) return 0; // First page is 0%
  return Math.round(((currentMaxPage.value - 1) / (totalPages.value - 1)) * 100);
});

const leftPageImage = computed(() => {
  if (displayedLeftPage.value === 0) {
    // First page behavior depends on singleFirstPage option
    if (config.value.singleFirstPage) {
      return null; // Single page mode: no left page
    } else {
      // Spread mode: left page shows page 1
      return props.pages[0]?.front || null;
    }
  }

  if (!config.value.singleFirstPage) {
    // Spread mode: each page pair is a spread
    // currentPage=1 -> pages[1].front (page 3)
    // currentPage=2 -> pages[2].front (page 5)
    return props.pages[displayedLeftPage.value]?.front || null;
  }

  // Single page mode: left page shows the back of the previously flipped page
  // When currentPage=1: we just flipped pages[0], so show pages[0].back (Page 2)
  // When currentPage=2: we just flipped pages[1], so show pages[1].back (Page 4)
  const flippedPageIndex = displayedLeftPage.value - 1;
  return props.pages[flippedPageIndex]?.back || null;
});

const rightPageImage = computed(() => {
  if (!config.value.singleFirstPage) {
    // Spread mode: right page shows the back of current page
    return props.pages[currentPage.value]?.back || null;
  }
  // Single page mode: right page shows the front of current page
  return props.pages[currentPage.value]?.front || null;
});

// Watch currentPage and update displayedLeftPage with delay
// Keep the old left page visible during flip animation,
// then update it slightly before animation completes to avoid white flash
watch(currentPage, (newPage, oldPage) => {
  // Handle initial load
  if (oldPage === undefined) {
    displayedLeftPage.value = newPage;
    return;
  }

  // For non-flip animations, update immediately
  if (animationType.value !== 'flip') {
    displayedLeftPage.value = newPage;
    return;
  }

  if (newPage > oldPage) {
    // Flipping forward - update left page just before animation completes
    // This ensures smooth transition without white flash
    setTimeout(() => {
      displayedLeftPage.value = newPage;
    }, config.value.duration * 0.9);
  } else if (newPage < oldPage) {
    // Flipping backward - update left page immediately
    displayedLeftPage.value = newPage;
  } else {
    // No change
    displayedLeftPage.value = newPage;
  }
}, { immediate: true });

// Watch animationType changes and update displayedLeftPage immediately
watch(animationType, () => {
  displayedLeftPage.value = currentPage.value;
});

// Preload images for current, next, and previous pages
watchEffect(() => {
  const imagesToPreload: string[] = [];

  // Helper to safely add image URLs
  const addImage = (url: string | null) => {
    if (url) imagesToPreload.push(url);
  };

  // Current page images
  const currentPageIndex = currentPage.value;

  if (!config.value.singleFirstPage) {
    // Spread mode
    // Left page
    if (currentPageIndex === 0) {
      addImage(props.pages[0]?.front);
    } else {
      addImage(props.pages[currentPageIndex]?.front);
    }
    // Right page (front and back)
    addImage(props.pages[currentPageIndex]?.back);

    // Next page
    if (currentPageIndex + 1 < props.pages.length) {
      addImage(props.pages[currentPageIndex + 1]?.front);
      addImage(props.pages[currentPageIndex + 1]?.back);
    }
  } else {
    // Single first page mode
    // Current left page
    if (currentPageIndex > 0) {
      const flippedPageIndex = currentPageIndex - 1;
      addImage(props.pages[flippedPageIndex]?.back);
    }

    // Current right page
    addImage(props.pages[currentPageIndex]?.front);
    addImage(props.pages[currentPageIndex]?.back);

    // Next page
    if (currentPageIndex + 1 < props.pages.length) {
      addImage(props.pages[currentPageIndex + 1]?.front);
      addImage(props.pages[currentPageIndex + 1]?.back);
    }
  }

  // Previous page (for backward navigation)
  if (currentPageIndex > 0) {
    addImage(props.pages[currentPageIndex - 1]?.front);
    addImage(props.pages[currentPageIndex - 1]?.back);
  }

  // Preload all collected images
  if (imagesToPreload.length > 0) {
    preloadImages(imagesToPreload);
  }
});

const bookStyle = computed(() => ({
  height: '100%',
  aspectRatio: `${config.value.width} / ${config.value.height}`,
  perspective: `${config.value.perspective}px`,
}));

const leftPageStyle = computed(() => ({
  width: '50%',
  height: '100%',
  left: isRTL.value ? '50%' : '0',
}));

const getRightPageStyle = (index: number) => ({
  width: '50%',
  height: '100%',
  left: isRTL.value ? '0' : '50%',
  zIndex: props.pages.length - index,
  transition: `transform ${config.value.duration}ms ${config.value.easing}`,
});

const nextPage = () => {
  emit('flip-start', currentPage.value + 1);
  next();
  setTimeout(() => {
    emit('page-change', currentPage.value);
    emit('flip-end', currentPage.value);
  }, config.value.duration);
};

const prevPage = () => {
  emit('flip-start', currentPage.value - 1);
  prev();
  setTimeout(() => {
    emit('page-change', currentPage.value);
    emit('flip-end', currentPage.value);
  }, config.value.duration);
};

const goToFirstPage = () => {
  if (currentPage.value !== 0 && !isFlipping.value) {
    emit('flip-start', 0);
    goToPage(0);
    setTimeout(() => {
      emit('page-change', currentPage.value);
      emit('flip-end', currentPage.value);
    }, config.value.duration);
  }
};

const goToLastPage = () => {
  if (currentPage.value !== props.pages.length && !isFlipping.value) {
    emit('flip-start', props.pages.length);
    goToPage(props.pages.length);
    setTimeout(() => {
      emit('page-change', currentPage.value);
      emit('flip-end', currentPage.value);
    }, config.value.duration);
  }
};

const handleLeftPageClick = () => {
  if (canGoPrev.value && !isFlipping.value) {
    prevPage();
  }
};

const handlePageClick = (index: number) => {
  if (index === currentPage.value - 1 && canGoPrev.value) {
    prevPage();
  } else if (index === currentPage.value && canGoNext.value) {
    nextPage();
  }
};

const handleDragStart = (e: MouseEvent | TouchEvent) => {
  onDragStart(e);
};

const handleDragMove = (e: MouseEvent | TouchEvent) => {
  onDragMove(e);
};

const handleDragEnd = () => {
  onDragEnd();
};

// Maximize functionality (within browser viewport)
const toggleMaximize = () => {
  isMaximized.value = !isMaximized.value;
};

// Fullscreen functionality
const toggleFullscreen = async () => {
  try {
    if (!document.fullscreenElement) {
      // Enter fullscreen mode - fullscreen the component container
      if (containerRef.value) {
        await containerRef.value.requestFullscreen();
      }
    } else {
      // Exit fullscreen mode
      await document.exitFullscreen();
    }
  } catch (err) {
    console.error('Failed to toggle fullscreen:', err);
  }
};

const handleFullscreenChange = () => {
  isFullscreen.value = !!document.fullscreenElement;
};

// Add fullscreen event listeners
onMounted(() => {
  document.addEventListener('fullscreenchange', handleFullscreenChange);
});

onUnmounted(() => {
  document.removeEventListener('fullscreenchange', handleFullscreenChange);
});

// Get the image for the right page front
// In spread mode, show the back (right page of the spread)
const getRightPageFront = (index: number) => {
  if (!config.value.singleFirstPage) {
    // Spread mode: right page shows the back of the current page pair
    // pages[0].back = page 2, pages[1].back = page 4, etc.
    return props.pages[index]?.back || '';
  }
  return props.pages[index]?.front || '';
};

// Get the image for the right page back (shown during flip animation)
// In spread mode, show the next spread's left page
const getRightPageBack = (index: number) => {
  if (!config.value.singleFirstPage) {
    // Spread mode: when flipping, show the next spread's left page
    // This creates a smooth transition to the next spread
    return props.pages[index + 1]?.front || '';
  }
  return props.pages[index]?.back || '';
};

defineExpose({
  currentPage,
  nextPage,
  prevPage,
  goToPage,
  goToFirstPage,
  goToLastPage,
});
</script>

<style scoped>
.book-flip-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
  user-select: none;
  width: 100%;
  background: #000000;
  padding: 0;
}

.book-flip-container.maximized {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.book-flip-container:fullscreen {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.book-flip {
  position: relative;
  transform-style: preserve-3d;
  max-width: 100%;
  max-height: 100%;
  min-height: 600px;
}

.book-flip-container.maximized .book-flip {
  height: calc(100vh - 60px);
  width: auto;
  max-width: 100%;
}

.book-flip-container:fullscreen .book-flip {
  height: calc(100vh - 60px);
  width: auto;
  max-width: 100%;
}

.page-left {
  position: absolute;
  background: white;
  overflow: hidden;
  z-index: 1;
}

.page-left.clickable {
  cursor: pointer;
}

.left-page-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
}

.page-left img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  user-select: none;
  pointer-events: none;
}

.page-left::after {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    to left,
    rgba(0, 0, 0, 0.15) 0%,
    rgba(0, 0, 0, 0.05) 5%,
    transparent 15%
  );
  pointer-events: none;
  z-index: 2;
}

.book-flip.rtl .page-left::after {
  left: 0;
  right: auto;
  background: linear-gradient(
    to right,
    rgba(0, 0, 0, 0.15) 0%,
    rgba(0, 0, 0, 0.05) 5%,
    transparent 15%
  );
}

.page-left.first-page::after {
  opacity: 0;
}


.page-right {
  position: absolute;
  transform-origin: left center;
  transform-style: preserve-3d;
  cursor: pointer;
  transition: transform 0.8s cubic-bezier(0.645, 0.045, 0.355, 1);
}

.book-flip.rtl .page-right {
  transform-origin: right center;
}

.page-right.active {
  pointer-events: auto;
}

.page-right::before {
  content: '';
  position: absolute;
  top: 0;
  left: -2px;
  width: 2px;
  height: 100%;
  background: linear-gradient(to right, #aaa, #fff);
  transform-origin: left center;
  transform: rotateY(90deg);
  z-index: 10;
}

.book-flip.rtl .page-right::before {
  left: auto;
  right: -2px;
  background: linear-gradient(to left, #aaa, #fff);
  transform-origin: right center;
}

.page-right::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    to right,
    rgba(0, 0, 0, 0.15) 0%,
    rgba(0, 0, 0, 0.05) 5%,
    transparent 15%
  );
  opacity: 1;
  pointer-events: none;
  z-index: 5;
}

.book-flip.rtl .page-right::after {
  left: auto;
  right: 0;
  background: linear-gradient(
    to left,
    rgba(0, 0, 0, 0.15) 0%,
    rgba(0, 0, 0, 0.05) 5%,
    transparent 15%
  );
}

.page-right.last-page::after {
  opacity: 0;
}

.page-right:hover:not(.flipped) {
  /* Removed shadow for cleaner appearance */
}

.page-right.flipped {
  transform: rotateY(-180deg);
  pointer-events: none;
}

.book-flip.rtl .page-right.flipped {
  transform: rotateY(180deg);
}

.page-right.flipped:not(.flipping) {
  /* Hide only after animation completes */
  visibility: hidden;
  z-index: 0 !important;
}

.page-content {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  background: white;
  overflow: hidden;
}

.page-content img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  user-select: none;
  pointer-events: none;
}

.page-content.back {
  transform: rotateY(180deg);
}

.controls {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
}

.toolbar {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 1rem;
  background: #f8f8f8;
  border: none;
  border-top: 1px solid #d0d0d0;
  padding: 0.5rem 1rem;
  width: 100%;
}

.toolbar-buttons {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  flex-shrink: 0;
}

.control-btn {
  padding: 0.3rem 0.5rem;
  font-size: 1rem;
  cursor: pointer;
  border: none;
  background: transparent;
  color: #555;
  transition: all 0.2s;
  border-radius: 4px;
  min-width: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.control-btn:hover:not(:disabled) {
  background: rgba(0, 0, 0, 0.08);
  color: #333;
}

.control-btn:active:not(:disabled) {
  background: rgba(0, 0, 0, 0.15);
  transform: scale(0.95);
}

.control-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.progress-bar {
  position: relative;
  flex-grow: 1;
  height: 8px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  overflow: visible;
}

.progress-fill {
  height: 100%;
  background: #4CAF50;
  transition: width 0.3s ease;
  border-radius: 4px;
  position: relative;
}

.progress-fill::after {
  content: '';
  position: absolute;
  right: -8px;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  background: #4CAF50;
  border: 2px solid white;
  border-radius: 50%;
  transition: right 0.3s ease;
}

.page-info {
  flex-shrink: 0;
  white-space: nowrap;
}

.page-indicator {
  font-size: 0.85rem;
  color: #333;
  font-weight: 600;
  user-select: none;
}

.maximize-btn,
.fullscreen-btn {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem 0.6rem;
  background: transparent;
  color: #555;
  border: none;
  border-radius: 3px;
  font-size: 0.85rem;
  margin-left: 0.4rem;
}

.maximize-btn:hover:not(:disabled),
.fullscreen-btn:hover:not(:disabled) {
  background: rgba(0, 0, 0, 0.05);
  color: #333;
}

.maximize-btn:active:not(:disabled),
.fullscreen-btn:active:not(:disabled) {
  background: rgba(0, 0, 0, 0.1);
  transform: scale(0.98);
}

.maximize-btn svg,
.fullscreen-btn svg {
  flex-shrink: 0;
}

.btn-text {
  white-space: nowrap;
  font-size: 0.85rem;
}

/* Simple animation mode (slide/none) */
.book-simple {
  position: relative;
  transform-style: preserve-3d;
  max-width: 100%;
  max-height: 100%;
  min-height: 600px;
  overflow: hidden;
}

.book-flip-container.maximized .book-simple {
  height: calc(100vh - 60px);
  width: auto;
  max-width: 100%;
}

.book-flip-container:fullscreen .book-simple {
  height: calc(100vh - 60px);
  width: auto;
  max-width: 100%;
}

.simple-pages-container {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
}

.simple-page {
  position: relative;
  width: 50%;
  height: 100%;
  background: white;
  overflow: hidden;
  transition: opacity 0.3s ease;
}

.book-simple.animation-none .simple-page {
  transition: none;
}

.simple-page.clickable {
  cursor: pointer;
}

.simple-page img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  user-select: none;
  pointer-events: none;
  transition: transform 0.3s ease;
}

.book-simple.animation-none .simple-page img {
  transition: none;
}

.simple-page-left {
  border-right: 1px solid #ddd;
}

.simple-page-right {
  border-left: 1px solid #ddd;
}

.book-simple.rtl .simple-page-left {
  border-right: none;
  border-left: 1px solid #ddd;
  order: 2;
}

.book-simple.rtl .simple-page-right {
  border-left: none;
  border-right: 1px solid #ddd;
  order: 1;
}
</style>
