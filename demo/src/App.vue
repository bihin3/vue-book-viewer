<template>
  <div class="demo-container">
    <header>
      <h1>Vue Book Viewer Demo</h1>
    </header>

    <main>
      <section class="settings-section">
        <div class="settings-panel">
          <button @click="toggleRTL" class="setting-btn" :class="{ active: options.rtl }">
            {{ options.rtl ? '右綴じモード' : '左綴じモード' }}
          </button>
          <button @click="toggleSingleFirstPage" class="setting-btn" :class="{ active: !options.singleFirstPage }">
            {{ options.singleFirstPage ? '1ページ目: 単一ページ' : '1ページ目: 両開き' }}
          </button>
          <button @click="toggleAutoPlay" class="setting-btn" :class="{ active: isAutoPlaying }">
            {{ isAutoPlaying ? '自動再生停止' : '自動再生開始' }}
          </button>
        </div>
      </section>

      <section class="demo-section">
        <BookFlip
          ref="bookRef"
          :pages="pages"
          :options="options"
          :show-controls="true"
          :show-progress="true"
          @page-change="handlePageChange"
          @flip-start="handleFlipStart"
          @flip-end="handleFlipEnd"
        />
      </section>

      <section class="demo-section">
        <h2>イベントログ</h2>
        <div class="event-log">
          <div v-for="(event, index) in events" :key="index" class="event-item">
            {{ event }}
          </div>
        </div>
      </section>
    </main>

    <footer>
      <p>Vue Book Viewer - MIT License</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import BookFlip from '../../src/components/BookFlip.vue';
import type { BookFlipOptions } from '../../src/types';

const bookRef = ref();
const isAutoPlaying = ref(false);
const events = ref<string[]>([]);

// ページ構造の説明:
// front: 右側に表示されるページ（めくる前に見えるページ）
// back: めくった後に左側に表示されるページ
const pages = [
  {
    front: '/images/a4/a4_portrait_1.png',  // 最初の右ページ (Page 1)
    back: '/images/a4/a4_portrait_2.png'    // めくった後の左ページ (Page 2)
  },
  {
    front: '/images/a4/a4_portrait_3.png',  // 2番目の右ページ (Page 3)
    back: '/images/a4/a4_portrait_4.png'    // めくった後の左ページ (Page 4)
  },
  {
    front: '/images/a4/a4_portrait_5.png',  // 3番目の右ページ (Page 5)
    back: '/images/a4/a4_portrait_6.png'    // めくった後の左ページ (Page 6)
  },
];

const options = reactive<BookFlipOptions>({
  width: 900,
  height: 636,
  duration: 800,
  perspective: 2000,
  autoPlay: false,
  autoPlayInterval: 3000,
  rtl: false,
  singleFirstPage: true,
});

const addEvent = (message: string) => {
  const timestamp = new Date().toLocaleTimeString();
  events.value.unshift(`[${timestamp}] ${message}`);
  if (events.value.length > 10) {
    events.value.pop();
  }
};

const handlePageChange = (page: number) => {
  addEvent(`ページが変更されました: ${page + 1}`);
};

const handleFlipStart = (page: number) => {
  addEvent(`ページめくり開始: ${page + 1}ページへ`);
};

const handleFlipEnd = (page: number) => {
  addEvent(`ページめくり完了: ${page + 1}ページ`);
};

const toggleAutoPlay = () => {
  isAutoPlaying.value = !isAutoPlaying.value;
  options.autoPlay = isAutoPlaying.value;
  addEvent(isAutoPlaying.value ? '自動再生を開始しました' : '自動再生を停止しました');
};

const toggleRTL = () => {
  options.rtl = !options.rtl;
  addEvent(options.rtl ? '右綴じモードに切り替えました' : '左綴じモードに切り替えました');
};

const toggleSingleFirstPage = () => {
  options.singleFirstPage = !options.singleFirstPage;
  addEvent(options.singleFirstPage ? '1ページ目を単一ページ表示に切り替えました' : '1ページ目を両開き表示に切り替えました');
};
</script>

<style scoped>
.demo-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
}

header {
  text-align: center;
  margin-bottom: 2rem;
}

h1 {
  color: #2c3e50;
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}

header p {
  color: #7f8c8d;
  font-size: 1.1rem;
}

.settings-section {
  margin-bottom: 2rem;
}

.settings-panel {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
  padding: 1rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.setting-btn {
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  background: white;
  color: #495057;
  border: 2px solid #dee2e6;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 500;
}

.setting-btn:hover {
  border-color: #4ECDC4;
  color: #4ECDC4;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(78, 205, 196, 0.2);
}

.setting-btn.active {
  background: #4ECDC4;
  color: white;
  border-color: #4ECDC4;
}

.demo-section {
  margin-bottom: 3rem;
  padding: 2rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.demo-section h2 {
  color: #2c3e50;
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
}

.event-log {
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  padding: 1rem;
  max-height: 200px;
  overflow-y: auto;
}

.event-item {
  padding: 0.5rem;
  border-bottom: 1px solid #f0f0f0;
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
  color: #495057;
}

.event-item:last-child {
  border-bottom: none;
}

footer {
  text-align: center;
  margin-top: 4rem;
  padding-top: 2rem;
  border-top: 1px solid #dee2e6;
  color: #7f8c8d;
}

@media (max-width: 768px) {
  .demo-container {
    padding: 1rem;
  }

  h1 {
    font-size: 1.8rem;
  }

  .demo-section {
    padding: 1rem;
  }
}
</style>
