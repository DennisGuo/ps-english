<template>
  <div class="learn-unit-view">
    <!-- ============ UNIT HERO ============ -->
    <header class="unit-hero hero animate-slide-up">
      <span class="spark spark--1">✨</span>
      <span class="spark spark--2">⭐</span>
      <div class="hero-inner">
        <div class="hero-eyebrow">{{ gradeName }} · {{ semesterName }}</div>
        <h1 class="hero-title">Unit {{ unit }}</h1>
        <div class="unit-topics" v-if="topics.length">
          <span class="chip" v-for="topic in topics" :key="topic">{{ topic }}</span>
        </div>
      </div>
    </header>

    <!-- 进度 -->
    <div class="learn-progress">
      <div class="progress-bar">
        <div class="fill" :style="{ width: progressPercent + '%' }"></div>
      </div>
      <span class="progress-text">{{ currentIndex + 1 }} / {{ unitWords.length }}</span>
    </div>

    <!-- 单词卡片 -->
    <div class="word-card-container" v-if="currentWord">
      <transition name="slide" mode="out-in">
        <div class="word-card animate-bounce-in" :key="currentWord.id">
          <div class="word-main">
            <button class="play-btn" :class="{ playing: isPlaying }" @click="playWordAudio">🔊</button>
            <div class="word-english">{{ currentWord.english }}</div>
            <div class="word-phonetic">{{ currentWord.phonetic }}</div>
            <div class="word-chinese" v-if="showChinese">{{ currentWord.chinese }}</div>
            <button v-else class="btn btn-ghost btn-sm" @click="showChinese = true">👀 点击查看中文</button>
          </div>

          <div class="word-example">
            <div class="example-header">
              <span>📝 例句</span>
              <button class="play-btn-sm" @click="playSentenceAudio">🔊</button>
            </div>
            <div class="en">{{ currentWord.example }}</div>
            <div class="cn">{{ currentWord.exampleCn }}</div>
          </div>

          <div class="word-actions">
            <button class="btn btn-outline btn-sm" @click="markAsKnown(false)">😕 不认识</button>
            <button class="btn btn-primary btn-sm" @click="markAsKnown(true)">😊 认识了</button>
          </div>
        </div>
      </transition>
    </div>

    <!-- 底部导航 -->
    <div class="word-nav">
      <button class="btn btn-ghost" @click="prevWord" :disabled="currentIndex === 0">← 上一个</button>
      <button class="btn btn-ghost" @click="shuffleWords">🔀 随机</button>
      <button class="btn btn-ghost" @click="nextWord" :disabled="currentIndex >= unitWords.length - 1">下一个 →</button>
    </div>

    <!-- 完成状态 -->
    <div class="completion-card card" v-if="showCompletion">
      <div class="completion-emoji animate-bounce-in">🎉</div>
      <h3>太棒了！</h3>
      <p>你已学完本单元所有单词</p>
      <div class="completion-stats">
        <span>认识 {{ knownCount }} 个</span>
        <span class="dot">·</span>
        <span>不认识 {{ unknownCount }} 个</span>
      </div>
      <div class="completion-actions">
        <button class="btn btn-outline" @click="restart">🔄 再学一遍</button>
        <router-link to="/quiz" class="btn btn-primary">🎮 去闯关</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useVocabularyStore } from '../stores/vocabulary'
import { useUserStore } from '../stores/user'
import { useAudio } from '../composables/useAudio'

const route = useRoute()
const vocabStore = useVocabularyStore()
const userStore = useUserStore()
const { isPlaying, playWord: doPlayWord, playSentence: doPlaySentence } = useAudio()

const grade = computed(() => parseInt(route.params.grade))
const semester = computed(() => parseInt(route.params.semester))
const unitWords = ref([])
const currentIndex = ref(0)
const showChinese = ref(false)
const showCompletion = ref(false)
const knownCount = ref(0)
const unknownCount = ref(0)

const gradeName = computed(() => `${'三四五六'[grade.value - 3]}年级`)
const semesterName = computed(() => semester.value === 1 ? '上册' : '下册')
const unit = computed(() => 1) // Default to first unit

const topics = computed(() => {
  if (!unitWords.value.length) return []
  return [...new Set(unitWords.value.map(w => w.topic))]
})

const currentWord = computed(() => unitWords.value[currentIndex.value])

const progressPercent = computed(() => {
  if (!unitWords.value.length) return 0
  return ((currentIndex.value + 1) / unitWords.value.length) * 100
})

function playWordAudio() {
  if (!currentWord.value) return
  doPlayWord(currentWord.value.id)
}

function playSentenceAudio() {
  if (!currentWord.value) return
  doPlaySentence(currentWord.value.id)
}

function markAsKnown(known) {
  if (known) {
    userStore.markWordLearned(currentWord.value.id)
    knownCount.value++
  } else {
    userStore.addWrongWord(currentWord.value.id)
    unknownCount.value++
  }

  if (currentIndex.value < unitWords.value.length - 1) {
    nextWord()
  } else {
    showCompletion.value = true
  }
}

function nextWord() {
  if (currentIndex.value < unitWords.value.length - 1) {
    currentIndex.value++
    showChinese.value = false
  }
}

function prevWord() {
  if (currentIndex.value > 0) {
    currentIndex.value--
    showChinese.value = false
  }
}

function shuffleWords() {
  unitWords.value = [...unitWords.value].sort(() => Math.random() - 0.5)
  currentIndex.value = 0
  showChinese.value = false
  showCompletion.value = false
}

function restart() {
  currentIndex.value = 0
  showChinese.value = false
  showCompletion.value = false
  knownCount.value = 0
  unknownCount.value = 0
}

onMounted(async () => {
  await vocabStore.loadVocabulary()
  // 获取该年级/学期的所有单词，按unit分组取第一个unit
  const units = vocabStore.getUnitsForGradeSemester(grade.value, semester.value)
  if (units.length > 0) {
    unitWords.value = vocabStore.getWordsByUnit(grade.value, semester.value, units[0])
  }
})
</script>

<style scoped>
/* ============================================
   UNIT HERO
   ============================================ */
.hero {
  position: relative;
  border-radius: var(--radius-2xl);
  padding: 24px 24px;
  margin-bottom: 18px;
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
  width: 210px; height: 210px;
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
  letter-spacing: 0.06em;
  padding: 5px 12px;
  border-radius: var(--radius-full);
  background: rgba(255, 255, 255, 0.16);
  margin-bottom: 8px;
}
.hero-title {
  font-family: var(--font-display);
  font-size: clamp(24px, 5vw, 32px);
  font-weight: 700;
  letter-spacing: -0.02em;
  text-shadow: 0 2px 12px rgba(0, 0, 0, 0.18);
}
.unit-topics { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 12px; }
.chip {
  padding: 4px 12px;
  border-radius: var(--radius-full);
  font-size: 12px;
  font-weight: 500;
  background: rgba(255, 255, 255, 0.16);
  border: 1px solid rgba(255, 255, 255, 0.18);
  backdrop-filter: blur(4px);
}

@keyframes twinkle { 0% { opacity: 0.55; } 100% { opacity: 1; } }
@keyframes floatSpark { 0%, 100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-9px) rotate(12deg); } }

/* ============================================
   PROGRESS
   ============================================ */
.learn-progress {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 18px;
}
.learn-progress .progress-bar { flex: 1; }
.progress-text { font-family: var(--font-display); font-size: 14px; font-weight: 600; color: var(--text-secondary); white-space: nowrap; }

/* ============================================
   WORD CARD
   ============================================ */
.word-card-container { margin-bottom: 14px; }
.word-main { text-align: center; padding: 14px 0 4px; }
.word-actions { display: flex; gap: 12px; justify-content: center; margin-top: 20px; }

.example-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
  font-weight: 600;
  font-size: 14px;
  color: var(--text-primary);
}
.play-btn-sm {
  width: 32px; height: 32px;
  border-radius: 50%;
  border: none;
  background: var(--primary-ghost);
  cursor: pointer;
  font-size: 16px;
  transition: var(--transition);
}
.play-btn-sm:hover { background: var(--bg-gradient); color: #fff; transform: scale(1.1); }

.word-nav { display: flex; justify-content: space-between; gap: 8px; margin-bottom: 18px; }

/* 卡片切换 */
.slide-enter-active, .slide-leave-active { transition: all 0.3s var(--ease); }
.slide-enter-from { transform: translateX(30px); opacity: 0; }
.slide-leave-to { transform: translateX(-30px); opacity: 0; }

/* ============================================
   COMPLETION
   ============================================ */
.completion-card { text-align: center; padding: 32px 22px; }
.completion-emoji { font-size: 64px; margin-bottom: 10px; }
.completion-card h3 { font-family: var(--font-display); font-size: 24px; font-weight: 700; margin-bottom: 8px; color: var(--text-primary); }
.completion-card p { color: var(--text-secondary); margin-bottom: 14px; }
.completion-stats { display: flex; gap: 8px; justify-content: center; margin-bottom: 20px; color: var(--text-secondary); font-size: 14px; }
.completion-stats .dot { color: var(--text-light); }
.completion-actions { display: flex; gap: 12px; justify-content: center; }

/* ============================================
   RESPONSIVE
   ============================================ */
@media (min-width: 768px) {
  .hero { padding: 30px 32px; }
  .hero-title { font-size: 34px; }
  .word-card { padding: 36px 32px; }
  .word-actions { gap: 16px; margin-top: 24px; }
  .word-actions .btn { padding: 12px 28px; font-size: 16px; }
  .word-nav .btn { padding: 10px 20px; }
  .completion-card { padding: 40px 32px; }
  .completion-emoji { font-size: 80px; }
  .completion-card h3 { font-size: 28px; }
}

@media (min-width: 1024px) {
  .word-card-container { max-width: 640px; margin-left: auto; margin-right: auto; }
  .word-card { padding: 48px 40px; }
  .word-actions .btn { padding: 14px 36px; font-size: 18px; }
  .word-nav { max-width: 640px; margin-left: auto; margin-right: auto; }
  .completion-card { max-width: 640px; margin-left: auto; margin-right: auto; padding: 48px 40px; }
  .completion-emoji { font-size: 96px; }
  .completion-card h3 { font-size: 32px; }
}

@media (min-width: 1440px) {
  .word-card-container, .word-nav, .completion-card { max-width: 720px; }
}
</style>
