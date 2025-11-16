<template>
  <div class="animation-menu" ref="menuRef">
    <button
      @click="toggleMenu"
      class="control-btn menu-btn"
      title="設定"
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="8" cy="2.5" r="1.5" fill="currentColor"/>
        <circle cx="8" cy="8" r="1.5" fill="currentColor"/>
        <circle cx="8" cy="13.5" r="1.5" fill="currentColor"/>
      </svg>
      <span class="btn-text">設定</span>
    </button>

    <div v-if="isOpen" class="menu-dropdown">
      <div class="menu-item has-submenu">
        <div class="menu-item-header" @click="toggleSubmenu">
          <span>アニメーション設定</span>
          <span class="current-value">{{ currentAnimationLabel }}</span>
        </div>

        <transition name="submenu-slide">
          <div v-if="showSubmenu" class="submenu-dropdown">
            <button
              v-for="option in animationOptions"
              :key="option.value"
              @click="selectAnimation(option.value)"
              class="submenu-item"
              :class="{ active: modelValue === option.value }"
            >
              {{ option.label }}
              <span v-if="modelValue === option.value" class="menu-item-check">✓</span>
            </button>
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import type { AnimationType } from '../types';

interface Props {
  modelValue: AnimationType;
}

interface Emits {
  (e: 'update:modelValue', value: AnimationType): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const isOpen = ref(false);
const showSubmenu = ref(false);
const menuRef = ref<HTMLElement>();

const animationOptions = [
  {
    value: 'flip' as AnimationType,
    label: 'フリップ'
  },
  {
    value: 'slide' as AnimationType,
    label: 'スライド'
  },
  {
    value: 'none' as AnimationType,
    label: 'なし'
  }
];

const currentAnimationLabel = computed(() => {
  const option = animationOptions.find(opt => opt.value === props.modelValue);
  return option ? option.label : 'フリップ';
});

const toggleMenu = () => {
  isOpen.value = !isOpen.value;
  showSubmenu.value = false;
};

const toggleSubmenu = () => {
  showSubmenu.value = !showSubmenu.value;
};

const selectAnimation = (value: AnimationType) => {
  emit('update:modelValue', value);
  showSubmenu.value = false;
  isOpen.value = false;
};

const handleClickOutside = (event: MouseEvent) => {
  if (menuRef.value && !menuRef.value.contains(event.target as Node)) {
    isOpen.value = false;
    showSubmenu.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
.animation-menu {
  position: relative;
  display: inline-block;
}

.menu-btn {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem 0.6rem;
}

.menu-dropdown {
  position: absolute;
  bottom: 100%;
  right: 0;
  margin-bottom: 0.5rem;
  background: white;
  border: 1px solid #d0d0d0;
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  width: max-content;
  z-index: 1000;
  overflow: visible;
}

.menu-item {
  position: relative;
  background: white;
}

.menu-item-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.6rem 0.9rem;
  cursor: pointer;
  transition: background 0.15s;
  font-size: 0.9rem;
  color: #333;
  white-space: nowrap;
  gap: 1rem;
}

.menu-item-header:hover {
  background: #f5f5f5;
}

.current-value {
  font-size: 0.85rem;
  color: #666;
  font-weight: 500;
  flex-shrink: 0;
}

.submenu-dropdown {
  position: absolute;
  top: 0;
  left: 100%;
  margin-left: 0.5rem;
  background: white;
  border: 1px solid #d0d0d0;
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  min-width: 150px;
  overflow: hidden;
}

.submenu-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0.6rem 1.5rem;
  border: none;
  background: white;
  text-align: left;
  cursor: pointer;
  transition: background 0.15s;
  font-size: 0.85rem;
  color: #555;
}

.submenu-item:hover {
  background: #f5f5f5;
}

.submenu-item.active {
  background: #e8f5e9;
  color: #2e7d32;
  font-weight: 500;
}

.menu-item-check {
  color: #4CAF50;
  font-weight: bold;
  font-size: 0.85rem;
  margin-left: 0.5rem;
}

/* Submenu transition */
.submenu-slide-enter-active,
.submenu-slide-leave-active {
  transition: all 0.2s ease;
}

.submenu-slide-enter-from {
  opacity: 0;
  transform: translateX(-10px);
}

.submenu-slide-leave-to {
  opacity: 0;
  transform: translateX(-10px);
}

.submenu-slide-enter-to,
.submenu-slide-leave-from {
  opacity: 1;
  transform: translateX(0);
}
</style>
