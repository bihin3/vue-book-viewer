<template>
  <div class="demo-container">
    <header>
      <h1>Vue Book Viewer Demo</h1>
      <p>物理的な本のようなページめくりアニメーションを実装するVue 3コンポーネント</p>
    </header>

    <main>
      <section class="demo-section">
        <h2>基本的な使い方</h2>
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

      <section class="demo-section">
        <h2>コントロール</h2>
        <div class="controls-panel">
          <button @click="jumpToFirstPage" class="btn">最初のページ</button>
          <button @click="jumpToLastPage" class="btn">最後のページ</button>
          <button @click="toggleAutoPlay" class="btn">
            {{ isAutoPlaying ? '自動再生停止' : '自動再生開始' }}
          </button>
        </div>
      </section>

      <section class="demo-section">
        <h2>オプション設定</h2>
        <div class="options-panel">
          <div class="option-group">
            <label>
              幅: {{ options.width }}px
              <input
                type="range"
                v-model.number="options.width"
                min="600"
                max="1200"
                step="100"
              />
            </label>
          </div>
          <div class="option-group">
            <label>
              高さ: {{ options.height }}px
              <input
                type="range"
                v-model.number="options.height"
                min="400"
                max="900"
                step="100"
              />
            </label>
          </div>
          <div class="option-group">
            <label>
              アニメーション時間: {{ options.duration }}ms
              <input
                type="range"
                v-model.number="options.duration"
                min="300"
                max="2000"
                step="100"
              />
            </label>
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

const jumpToFirstPage = () => {
  bookRef.value?.goToPage(0);
  addEvent('最初のページへジャンプ');
};

const jumpToLastPage = () => {
  bookRef.value?.goToPage(pages.length);
  addEvent('最後のページへジャンプ');
};

const toggleAutoPlay = () => {
  isAutoPlaying.value = !isAutoPlaying.value;
  options.autoPlay = isAutoPlaying.value;
  addEvent(isAutoPlaying.value ? '自動再生を開始しました' : '自動再生を停止しました');
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
  margin-bottom: 3rem;
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

.controls-panel {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.btn {
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  background: #4ECDC4;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn:hover {
  background: #45B7D1;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.options-panel {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.option-group {
  background: white;
  padding: 1rem;
  border-radius: 4px;
  border: 1px solid #dee2e6;
}

.option-group label {
  display: block;
  color: #495057;
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.option-group input[type="range"] {
  width: 100%;
  margin-top: 0.5rem;
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
