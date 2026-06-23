<template>
  <div class="review-view">
    <!-- ============ HERO ============ -->
    <header class="page-hero hero animate-slide-up">
      <span class="spark spark--1">✨</span>
      <span class="spark spark--2">⭐</span>
      <div class="hero-inner">
        <div class="hero-eyebrow">🔄 错题复习</div>
        <h1 class="hero-title">消灭错题</h1>
        <p class="hero-sub">巩固薄弱单词，把它们一个个拿下 💪</p>
      </div>
    </header>

    <!-- 空状态 -->
    <div class="empty-state" v-if="!wrongWords.length">
      <div class="emoji">🎉</div>
      <h3>没有错题！</h3>
      <p>太棒了，你没有需要复习的单词</p>
      <router-link to="/quiz" class="btn btn-primary">去闯关</router-link>
    </div>

    <!-- 复习内容 -->
    <div v-else>
      <div class="review-stats">
        <div class="stat-card animate-slide-up">
          <span class="stat-icon">🔁</span>
          <span class="stat-num">{{ wrongWords.length }}</span>
          <span class="stat-label">待复习</span>
        </div>
        <div class="stat-card animate-slide-up" style="animation-delay:.06s">
          <span class="stat-icon">📊</span>
          <span class="stat-num">{{ totalWrongAttempts }}</span>
          <span class="stat-label">总错误次数</span>
        </div>
      </div>

      <!-- 模式切换 -->
      <div class="segmented review-mode-toggle">
        <button :class="{ active: reviewMode === 'cards' }" @click="reviewMode = 'cards'">📇 卡片模式</button>
        <button :class="{ active: reviewMode === 'list' }" @click="reviewMode = 'list'">📋 列表模式</button>
      </div>

      <!-- 卡片模式 -->
      <div class="word-card-container" v-if="reviewMode === 'cards' && wrongWords.length">
        <div class="word-card animate-bounce-in" :key="currentReviewIndex">
          <div class="word-main">
            <button class="play-btn" @click="playAudio(currentWordData)">🔊</button>
            <div class="word-english">{{ currentWordData?.english }}</div>
            <div class="word-phonetic">{{ currentWordData?.phonetic }}</div>
            <div class="word-chinese" v-if="showAnswer">{{ currentWordData?.chinese }}</div>
            <button v-else class="btn btn-ghost btn-sm" @click="showAnswer = true">👀 显示答案</button>
          </div>
          <div class="word-example" v-if="showAnswer">
            <div class="en">{{ currentWordData?.example }}</div>
            <div class="cn">{{ currentWordData?.exampleCn }}</div>
          </div>
          <div class="review-actions" v-if="showAnswer">
            <button class="btn btn-outline btn-sm" @click="keepWord">😕 还没记住</button>
            <button class="btn btn-secondary btn-sm" @click="removeWord">😊 已掌握</button>
          </div>
        </div>
        <div class="card-nav">
          <button class="btn btn-ghost btn-sm" @click="prevCard" :disabled="currentReviewIndex === 0">← 上一个</button>
          <span class="nav-count">{{ currentReviewIndex + 1 }} / {{ wrongWords.length }}</span>
          <button class="btn btn-ghost btn-sm" @click="nextCard" :disabled="currentReviewIndex >= wrongWords.length - 1">下一个 →</button>
        </div>
      </div>

      <!-- 列表模式 -->
      <div class="review-list" v-if="reviewMode === 'list'">
        <div
          class="review-item card-clickable"
          v-for="item in wrongWordsWithDetails"
          :key="item.id"
          @click="playAudio(item)"
        >
          <div class="review-item-main">
            <span class="review-en">{{ item.english }}</span>
            <span class="review-cn">{{ item.chinese }}</span>
          </div>
          <div class="review-item-meta">
            <span class="badge badge-danger" v-if="item.wrongCount >= 3">错 {{ item.wrongCount }} 次</span>
            <span class="badge badge-warning" v-else-if="item.wrongCount >= 2">错 {{ item.wrongCount }} 次</span>
            <span class="badge badge-primary" v-else>错 {{ item.wrongCount }} 次</span>
            <button class="mini-btn" @click.stop="removeWordById(item.id)" title="已掌握">✅</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '../stores/user'
import { useVocabularyStore } from '../stores/vocabulary'

const userStore = useUserStore()
const vocabStore = useVocabularyStore()

const reviewMode = ref('cards')
const currentReviewIndex = ref(0)
const showAnswer = ref(false)

const wrongWords = computed(() => userStore.currentUser?.wrongWords || [])

const totalWrongAttempts = computed(() => {
  return wrongWords.value.reduce((sum, w) => sum + (w.count || 1), 0)
})

const wrongWordsWithDetails = computed(() => {
  return wrongWords.value.map(ww => {
    const word = vocabStore.getWordById(ww.wordId)
    return word ? { ...word, wrongCount: ww.count || 1 } : null
  }).filter(Boolean)
})

const currentWordData = computed(() => {
  const ww = wrongWords.value[currentReviewIndex.value]
  return ww ? vocabStore.getWordById(ww.wordId) : null
})

function playAudio(word) {
  if (!word) return
  const clean = word.english.toLowerCase().trim().replace(/ /g, '_').replace(/'/g, '').split('(')[0].trim()
  const audio = new Audio(`/data/audio/words/word_${clean}.mp3`)
  audio.play().catch(() => {})
}

function nextCard() {
  if (currentReviewIndex.value < wrongWords.value.length - 1) {
    currentReviewIndex.value++
    showAnswer.value = false
  }
}

function prevCard() {
  if (currentReviewIndex.value > 0) {
    currentReviewIndex.value--
    showAnswer.value = false
  }
}

function keepWord() {
  // 保留在错题集中
  nextCard()
}

function removeWord() {
  const ww = wrongWords.value[currentReviewIndex.value]
  if (ww) {
    userStore.removeWrongWord(ww.wordId)
    if (currentReviewIndex.value >= wrongWords.value.length) {
      currentReviewIndex.value = Math.max(0, wrongWords.value.length - 1)
    }
  }
  showAnswer.value = false
}

function removeWordById(wordId) {
  userStore.removeWrongWord(wordId)
}

onMounted(() => {
  vocabStore.loadVocabulary()
})
</script>

<style scoped>
/* ============================================
   HERO
   ============================================ */
.hero {
  position: relative;
  border-radius: var(--radius-2xl);
  padding: 26px 24px;
  margin-bottom: 22px;
  background: radial-gradient(130% 150% at 0% 0%, var(--primary) 0%, var(--deep) 72%);
  color: var(--text-on-dark);
  overflow: hidden;
  box-shadow: 0 18px 44px rgba(45, 27, 105, 0.3);
  isolation: isolate;
}
.hero::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image:
    radial-gradient(1.6px 1.6px at 18% 28%, rgba(255, 255, 255, 0.9), transparent 60%),
    radial-gradient(1.2px 1.2px at 72% 18%, rgba(255, 255, 255, 0.7), transparent 60%),
    radial-gradient(2px 2px at 42% 72%, rgba(255, 255, 255, 0.55), transparent 60%),
    radial-gradient(1.2px 1.2px at 86% 62%, rgba(255, 255, 255, 0.75), transparent 60%);
  animation: twinkle 4.5s ease-in-out infinite alternate;
  z-index: -1;
}
.hero::after {
  content: '';
  position: absolute;
  right: -70px; top: -70px;
  width: 220px; height: 220px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.16), transparent 68%);
  z-index: -1;
}
.spark {
  position: absolute;
  font-size: 18px;
  filter: drop-shadow(0 0 6px rgba(255, 255, 255, 0.6));
  animation: floatSpark 6s ease-in-out infinite;
  z-index: 0;
}
.spark--1 { top: 18%; left: 8%; }
.spark--2 { top: 66%; left: 12%; font-size: 14px; animation-delay: 1.4s; }
.hero-inner { position: relative; z-index: 1; }

.hero-eyebrow {
  display: inline-block;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.08em;
  padding: 5px 12px;
  border-radius: var(--radius-full);
  background: rgba(255, 255, 255, 0.16);
  margin-bottom: 10px;
}
.hero-title {
  font-family: var(--font-display);
  font-size: clamp(24px, 5vw, 32px);
  font-weight: 700;
  letter-spacing: -0.02em;
  text-shadow: 0 2px 12px rgba(0, 0, 0, 0.18);
}
.hero-sub { margin-top: 4px; font-size: clamp(13px, 2.4vw, 15px); color: var(--text-on-dark-muted); }

@keyframes twinkle { 0% { opacity: 0.55; } 100% { opacity: 1; } }
@keyframes floatSpark { 0%, 100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-9px) rotate(12deg); } }

/* ============================================
   STATS
   ============================================ */
.review-stats { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 18px; }
.stat-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: 16px;
  text-align: center;
  box-shadow: var(--shadow-card);
  border: 1.5px solid rgba(45, 27, 105, 0.04);
}
.stat-icon {
  font-size: 22px;
  width: 40px; height: 40px;
  display: grid; place-items: center;
  border-radius: 50%;
  background: var(--coral-light);
}
.stat-num {
  font-family: var(--font-display);
  font-size: 30px;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--coral);
}
.stat-label { font-size: 12px; color: var(--text-secondary); }

/* ============================================
   SEGMENTED TOGGLE
   ============================================ */
.segmented {
  display: flex;
  gap: 6px;
  background: var(--primary-ghost);
  padding: 4px;
  border-radius: var(--radius-lg);
  margin-bottom: 16px;
}
.segmented button {
  flex: 1;
  padding: 10px;
  border: none;
  background: transparent;
  border-radius: var(--radius-md);
  font-size: 14px;
  font-weight: 600;
  color: var(--text-secondary);
  cursor: pointer;
  transition: var(--transition);
  font-family: var(--font-body);
}
.segmented button:hover { color: var(--text-primary); }
.segmented button.active {
  background: var(--bg-card);
  color: var(--primary);
  box-shadow: var(--shadow-sm);
}

/* ============================================
   WORD CARD REVIEW
   ============================================ */
.word-main { text-align: center; padding: 14px 0 4px; }
.review-actions { display: flex; gap: 12px; justify-content: center; margin-top: 18px; }
.card-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 14px;
}
.nav-count { font-size: 13px; color: var(--text-secondary); font-weight: 500; }

/* ============================================
   LIST MODE
   ============================================ */
.review-list { display: flex; flex-direction: column; gap: 8px; }
.review-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-card);
  border: 1.5px solid rgba(45, 27, 105, 0.04);
  transition: var(--transition);
}
.review-item:hover { transform: translateY(-2px); box-shadow: var(--shadow-md); border-color: var(--primary-light); }
.review-item-main { display: flex; flex-direction: column; gap: 2px; }
.review-en { font-family: var(--font-display); font-size: 18px; font-weight: 600; letter-spacing: -0.01em; color: var(--text-primary); }
.review-cn { font-size: 13px; color: var(--text-secondary); }
.review-item-meta { display: flex; align-items: center; gap: 8px; }
.mini-btn {
  width: 30px; height: 30px;
  border: none;
  background: var(--teal-light);
  border-radius: 50%;
  cursor: pointer;
  font-size: 14px;
  transition: var(--transition);
}
.mini-btn:hover { background: var(--teal); transform: scale(1.12); }

/* ============================================
   RESPONSIVE
   ============================================ */
@media (min-width: 768px) {
  .hero { padding: 34px 32px; }
  .hero-title { font-size: 34px; }
  .review-stats { gap: 16px; }
  .stat-card { padding: 20px; }
  .stat-num { font-size: 38px; }
  .review-item { padding: 18px 22px; }
  .review-en { font-size: 20px; }
  .word-card { padding: 36px 32px; }
  .review-actions { gap: 16px; }
  .review-actions .btn { padding: 12px 28px; }
}

@media (min-width: 1024px) {
  .word-card-container { max-width: 640px; margin-left: auto; margin-right: auto; }
  .word-card { padding: 48px 40px; }
  .card-nav { max-width: 640px; margin-left: auto; margin-right: auto; }

  .review-list { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
  .review-item { padding: 20px 24px; }
  .review-en { font-size: 22px; }
}

@media (min-width: 1440px) {
  .review-list { grid-template-columns: repeat(3, 1fr); gap: 14px; }
  .review-item { padding: 22px 28px; }
  .review-en { font-size: 24px; }
  .word-card-container { max-width: 720px; }
}
</style>
