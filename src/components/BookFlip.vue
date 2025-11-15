<template>
  <div class="book-flip-container">
    <div
      class="book-flip"
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
      <div class="page-left" :style="leftPageStyle">
        <div class="left-page-wrapper">
          <img v-if="leftPageImage" :src="leftPageImage" alt="" draggable="false" class="left-page-img">
        </div>
      </div>

      <!-- Flipping pages (right side) -->
      <div
        v-for="(page, index) in pages"
        :key="index"
        class="page-right"
        :class="{
          flipped: index < currentPage,
          flipping: isFlipping && (index === currentPage || index === currentPage - 1),
          active: index === currentPage
        }"
        :style="getRightPageStyle(index)"
        @click="handlePageClick(index)"
      >
        <div class="page-content front">
          <slot name="page" :page="page.front" :index="index * 2 + 1">
            <img :src="page.front" alt="" draggable="false">
          </slot>
        </div>
        <div class="page-content back">
          <slot name="page" :page="page.back" :index="index * 2 + 2">
            <img :src="page.back" alt="" draggable="false">
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
        <span class="page-indicator">{{ currentPage * 2 + 1 }}-{{ Math.min(currentPage * 2 + 2, totalPages) }} / {{ totalPages }}</span>
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
import { ref, computed, watch } from 'vue';
import { useBookFlip } from '../composables/useBookFlip';
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

const totalPages = computed(() => props.pages.length * 2);

const leftPageImage = computed(() => {
  if (displayedLeftPage.value === 0) {
    return null; // First page, no left page
  }
  // Left page shows the back of the currently active (not yet flipped) page
  // When currentPage=1: we just flipped pages[0], so show pages[0].back (Page 2)
  // When currentPage=2: we just flipped pages[1], so show pages[1].back (Page 4)
  // When currentPage=3: we just flipped pages[2], so show pages[2].back (Page 6)
  const flippedPageIndex = displayedLeftPage.value - 1;
  return props.pages[flippedPageIndex]?.back || null;
});

// Watch currentPage and update displayedLeftPage with delay
// Keep the old left page visible during flip animation,
// then update it slightly before animation completes to avoid white flash
watch(currentPage, (newPage, oldPage) => {
  if (newPage > oldPage) {
    // Flipping forward - update left page just before animation completes
    // This ensures smooth transition without white flash
    setTimeout(() => {
      displayedLeftPage.value = newPage;
    }, config.duration * 0.9); // Update at 90% of animation duration
  } else if (newPage < oldPage) {
    // Flipping backward - update left page immediately
    displayedLeftPage.value = newPage;
  } else {
    // Initial load
    displayedLeftPage.value = newPage;
  }
}, { immediate: true });

const bookStyle = computed(() => ({
  width: `${config.width}px`,
  height: `${config.height}px`,
  perspective: `${config.perspective}px`,
}));

const leftPageStyle = computed(() => ({
  width: `${config.width / 2}px`,
  height: `${config.height}px`,
  left: '0px',
}));

const getRightPageStyle = (index: number) => ({
  width: `${config.width / 2}px`,
  height: `${config.height}px`,
  left: `${config.width / 2}px`,
  zIndex: props.pages.length - index,
  transition: `transform ${config.duration}ms ${config.easing}`,
});

const nextPage = () => {
  emit('flip-start', currentPage.value + 1);
  next();
  setTimeout(() => {
    emit('page-change', currentPage.value);
    emit('flip-end', currentPage.value);
  }, config.duration);
};

const prevPage = () => {
  emit('flip-start', currentPage.value - 1);
  prev();
  setTimeout(() => {
    emit('page-change', currentPage.value);
    emit('flip-end', currentPage.value);
  }, config.duration);
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
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
}

.page-left {
  position: absolute;
  background: white;
  box-shadow: inset -3px 0 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  z-index: 1;
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


.page-right {
  position: absolute;
  transform-origin: left center;
  transform-style: preserve-3d;
  cursor: pointer;
  transition: transform 0.8s cubic-bezier(0.645, 0.045, 0.355, 1);
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
    transparent 10%
  );
  opacity: 0;
  transition: opacity 0.8s;
  pointer-events: none;
  z-index: 5;
}

.page-right:hover:not(.flipped) {
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
}

.page-right.flipped {
  transform: rotateY(-180deg);
  pointer-events: none;
  /* Hide flipped pages behind the left page */
  z-index: 0 !important;
}

.page-right.flipped:not(.flipping) {
  /* Hide only after animation completes */
  visibility: hidden;
}

.page-right.flipped::after {
  opacity: 1;
}

.page-content {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  background: white;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.2);
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
