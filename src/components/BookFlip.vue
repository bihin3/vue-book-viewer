<template>
  <div class="book-flip-container">
    <div
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
          flipping: isFlipping && (index === currentPage || index === currentPage - 1),
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

    <div v-if="showControls" class="controls">
      <slot name="controls" :next="nextPage" :prev="prevPage" :current="currentPage" :total="pages.length">
        <button
          @click="prevPage"
          :disabled="!canGoPrev"
          class="control-btn"
        >
          ←
        </button>
        <span class="page-indicator">{{ currentPageRange }} / {{ totalPages }}</span>
        <button
          @click="nextPage"
          :disabled="!canGoNext"
          class="control-btn"
        >
          →
        </button>
      </slot>
    </div>

    <div v-if="showProgress" class="progress-bar">
      <div class="progress-fill" :style="{ width: `${progress}%` }"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, watchEffect } from 'vue';
import { useBookFlip } from '../composables/useBookFlip';
import { useImagePreload } from '../composables/useImagePreload';
import type { BookPage, BookFlipOptions, BookFlipEmits } from '../types';

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

const bookRef = ref<HTMLElement>();
const displayedLeftPage = ref(0); // Delayed left page update

const {
  currentPage,
  isFlipping,
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

// Watch currentPage and update displayedLeftPage with delay
// Keep the old left page visible during flip animation,
// then update it slightly before animation completes to avoid white flash
watch(currentPage, (newPage, oldPage) => {
  // Handle initial load
  if (oldPage === undefined) {
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
  width: `${config.value.width}px`,
  height: `${config.value.height}px`,
  perspective: `${config.value.perspective}px`,
}));

const leftPageStyle = computed(() => ({
  width: `${config.value.width / 2}px`,
  height: `${config.value.height}px`,
  left: isRTL.value ? `${config.value.width / 2}px` : '0px',
}));

const getRightPageStyle = (index: number) => ({
  width: `${config.value.width / 2}px`,
  height: `${config.value.height}px`,
  left: isRTL.value ? '0px' : `${config.value.width / 2}px`,
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
});
</script>

<style scoped>
.book-flip-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  user-select: none;
}

.book-flip {
  position: relative;
  transform-style: preserve-3d;
  background: #e0e0e0;
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
  gap: 1rem;
  align-items: center;
}

.control-btn {
  padding: 0.5rem 1rem;
  font-size: 1.2rem;
  cursor: pointer;
  border: 1px solid #ccc;
  background: white;
  border-radius: 4px;
  transition: all 0.2s;
}

.control-btn:hover:not(:disabled) {
  background: #f0f0f0;
  transform: scale(1.05);
}

.control-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.page-indicator {
  font-size: 1rem;
  color: #666;
  min-width: 100px;
  text-align: center;
}

.progress-bar {
  width: 100%;
  max-width: 400px;
  height: 4px;
  background: #e0e0e0;
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #4CAF50;
  transition: width 0.3s ease;
}
</style>
