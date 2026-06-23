<template>
  <div class="learn-view">
    <!-- ============ HERO ============ -->
    <header class="hero animate-slide-up">
      <span class="spark spark--1">✨</span>
      <span class="spark spark--2">⭐</span>
      <span class="spark spark--3">✨</span>
      <span class="spark spark--4">🌟</span>

      <div class="hero-inner">
        <div class="hero-eyebrow">🗺️ 单词冒险</div>
        <h1 class="hero-title">选择学习关卡</h1>
        <p class="hero-sub">按年级进入不同的冒险世界，逐个单元解锁新单词，点亮全部星星成为单词大师 ✨</p>

        <div class="hero-progress" v-if="totalWords">
          <div class="hero-progress-meta">
            <span class="hero-progress-label">总体进度</span>
            <span class="hero-progress-num">{{ overallProgress }}<small>%</small></span>
          </div>
          <div class="hero-progress-track">
            <div class="hero-progress-fill" :style="{ width: overallProgress + '%' }"></div>
          </div>
          <div class="hero-progress-stats">已掌握 {{ learnedCount }} / {{ totalWords }} 词</div>
        </div>
      </div>
    </header>

    <!-- ============ GRADE WORLD TABS ============ -->
    <nav class="grade-tabs" aria-label="选择年级">
      <button
        v-for="grade in grades"
        :key="grade.num"
        class="grade-tab animate-slide-up"
        :class="{ 'is-active': activeGrade === grade.num }"
        :style="{ '--accent': gradeAccent[grade.num], animationDelay: `${0.05 * (grade.num - 2)}s` }"
        @click="activeGrade = grade.num"
      >
        <span class="grade-tab-emoji">{{ grade.emoji }}</span>
        <span class="grade-tab-label">
          <span class="grade-tab-name">{{ grade.name }}</span>
          <span class="grade-tab-progress">{{ getGradeProgress(grade.num) }}% 已学</span>
        </span>
      </button>
    </nav>

    <!-- ============ GRADE CONTENT ============ -->
    <div class="grade-content" :key="activeGrade" :style="{ '--accent': gradeAccent[activeGrade] }">
      <div class="semester-grid">
        <section
          v-for="semester in [1, 2]"
          :key="semester"
          class="semester-panel"
        >
          <header class="semester-head">
            <span class="semester-badge">{{ semester === 1 ? '📕' : '📗' }}</span>
            <div class="semester-head-text">
              <h3 class="semester-title">{{ semester === 1 ? '上册' : '下册' }}</h3>
              <span class="semester-meta">
                {{ getSemesterUnitCount(activeGrade, semester) }} 个单元 · {{ getSemesterWordCount(activeGrade, semester) }} 词
              </span>
            </div>
          </header>

          <div class="unit-grid" v-if="getUnits(activeGrade, semester).length">
            <router-link
              v-for="unit in getUnits(activeGrade, semester)"
              :key="unit"
              :to="`/learn/${activeGrade}/${semester}`"
              class="unit-card"
              :class="unitStatusClass(activeGrade, semester, unit)"
            >
              <span class="unit-badge">{{ unit }}</span>
              <span class="unit-topic">{{ getUnitTopic(activeGrade, semester, unit) || '单词学习' }}</span>
              <span class="unit-meta">📝 {{ getUnitWordCount(activeGrade, semester, unit) }} 词</span>
              <span class="unit-stars" v-if="getUnitBestScore(activeGrade, semester, unit)">
                {{ '⭐'.repeat(getUnitBestScore(activeGrade, semester, unit)) }}
              </span>
              <span class="unit-crown" v-if="getUnitBestScore(activeGrade, semester, unit) >= 3">👑</span>
            </router-link>
          </div>

          <div class="unit-empty" v-else>🪄 单元即将上线</div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useVocabularyStore } from '../stores/vocabulary'
import { useUserStore } from '../stores/user'

const vocabStore = useVocabularyStore()
const userStore = useUserStore()
const activeGrade = ref(3)

const grades = [
  { num: 3, name: '三年级', emoji: '🌱' },
  { num: 4, name: '四年级', emoji: '🌿' },
  { num: 5, name: '五年级', emoji: '🌳' },
  { num: 6, name: '六年级', emoji: '🌲' }
]

// 每个年级一种冒险主题色
const gradeAccent = {
  3: '#2DD4BF', // 萌芽 · 青绿
  4: '#60A5FA', // 成长 · 晴空蓝
  5: '#FBBF24', // 繁茂 · 阳光金
  6: '#FB7185'  // 参天 · 珊瑚红
}

const totalWords = computed(() => vocabStore.words.length)
const learnedCount = computed(() => userStore.learnedCount || 0)
const overallProgress = computed(() => {
  if (!totalWords.value) return 0
  return Math.round((learnedCount.value / totalWords.value) * 100)
})

function getUnits(grade, semester) {
  return vocabStore.getUnitsForGradeSemester(grade, semester)
}

function getUnitTopic(grade, semester, unit) {
  const topics = vocabStore.getTopicsForUnit(grade, semester, unit)
  return topics.join(' · ') || ''
}

function getUnitWordCount(grade, semester, unit) {
  return vocabStore.getWordsByUnit(grade, semester, unit).length
}

function getSemesterUnitCount(grade, semester) {
  return getUnits(grade, semester).length
}

function getSemesterWordCount(grade, semester) {
  return getUnits(grade, semester).reduce(
    (sum, unit) => sum + getUnitWordCount(grade, semester, unit),
    0
  )
}

function getGradeProgress(grade) {
  const words = vocabStore.getWordsByGradeSemester(grade, 1).concat(
    vocabStore.getWordsByGradeSemester(grade, 2)
  )
  if (!words.length) return 0
  const learned = words.filter(w => userStore.currentUser?.learnedWords?.includes(w.id))
  return Math.round((learned.length / words.length) * 100)
}

function getUnitBestScore(grade, semester, unit) {
  const progress = userStore.getUnitProgress(grade, semester, unit)
  if (!progress || !progress.bestScore) return 0
  const ratio = progress.bestScore / progress.lastTotal
  if (ratio >= 0.9) return 3
  if (ratio >= 0.7) return 2
  if (ratio >= 0.5) return 1
  return 0
}

function unitStatusClass(grade, semester, unit) {
  const best = getUnitBestScore(grade, semester, unit)
  if (best >= 3) return 'is-mastered'
  if (best >= 1) return 'is-started'
  return 'is-new'
}

onMounted(() => {
  vocabStore.loadVocabulary()
})
</script>

<style scoped>
.learn-view { padding-bottom: 16px; }

/* ============================================
   HERO — 魔法夜空
   ============================================ */
.hero {
  position: relative;
  border-radius: var(--radius-2xl);
  padding: 30px 26px 26px;
  margin-bottom: 26px;
  background:
    radial-gradient(130% 150% at 0% 0%, var(--primary) 0%, var(--deep) 72%);
  color: var(--text-on-dark);
  overflow: hidden;
  box-shadow: 0 18px 44px rgba(45, 27, 105, 0.30);
  isolation: isolate;
}

/* 星空 */
.hero::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image:
    radial-gradient(1.6px 1.6px at 18% 28%, rgba(255, 255, 255, 0.9), transparent 60%),
    radial-gradient(1.2px 1.2px at 72% 18%, rgba(255, 255, 255, 0.7), transparent 60%),
    radial-gradient(2px 2px at 42% 72%, rgba(255, 255, 255, 0.55), transparent 60%),
    radial-gradient(1.2px 1.2px at 86% 62%, rgba(255, 255, 255, 0.75), transparent 60%),
    radial-gradient(1px 1px at 58% 38%, rgba(255, 255, 255, 0.5), transparent 60%),
    radial-gradient(1.4px 1.4px at 30% 88%, rgba(255, 255, 255, 0.6), transparent 60%);
  animation: twinkle 4.5s ease-in-out infinite alternate;
  z-index: -1;
}

/* 右上柔光月 */
.hero::after {
  content: '';
  position: absolute;
  right: -70px;
  top: -70px;
  width: 240px;
  height: 240px;
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
.spark--1 { top: 16%; left: 8%; animation-delay: 0s; }
.spark--2 { top: 64%; left: 14%; font-size: 14px; animation-delay: 1.4s; }
.spark--3 { top: 24%; right: 12%; font-size: 16px; animation-delay: 0.7s; }
.spark--4 { top: 70%; right: 8%; animation-delay: 2.1s; }

.hero-inner { position: relative; z-index: 1; max-width: 560px; }

.hero-eyebrow {
  display: inline-block;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.08em;
  padding: 5px 12px;
  border-radius: var(--radius-full);
  background: rgba(255, 255, 255, 0.16);
  backdrop-filter: blur(4px);
  margin-bottom: 12px;
}

.hero-title {
  font-family: var(--font-display);
  font-size: clamp(26px, 5.5vw, 38px);
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.1;
  text-shadow: 0 2px 12px rgba(0, 0, 0, 0.18);
}

.hero-sub {
  margin-top: 8px;
  font-size: clamp(13px, 2.4vw, 15px);
  color: var(--text-on-dark-muted);
  line-height: 1.5;
}

.hero-progress {
  margin-top: 20px;
  padding: 16px 18px;
  border-radius: var(--radius-lg);
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.16);
  backdrop-filter: blur(6px);
}

.hero-progress-meta {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 10px;
}

.hero-progress-label { font-size: 13px; color: var(--text-on-dark-muted); }

.hero-progress-num {
  font-family: var(--font-display);
  font-size: 26px;
  font-weight: 700;
  color: #fff;
}
.hero-progress-num small { font-size: 14px; opacity: 0.8; margin-left: 1px; }

.hero-progress-track {
  height: 10px;
  border-radius: var(--radius-full);
  background: rgba(255, 255, 255, 0.2);
  overflow: hidden;
}

.hero-progress-fill {
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, var(--amber) 0%, #fff 100%);
  box-shadow: 0 0 14px rgba(255, 255, 255, 0.55);
  transition: width 0.9s var(--ease);
}

.hero-progress-stats {
  margin-top: 10px;
  font-size: 12px;
  color: var(--text-on-dark-muted);
}

@keyframes twinkle {
  0% { opacity: 0.55; }
  100% { opacity: 1; }
}

@keyframes floatSpark {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-9px) rotate(12deg); }
}

/* ============================================
   GRADE TABS — 冒险世界
   ============================================ */
.grade-tabs {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin-bottom: 24px;
}

.grade-tab {
  --accent: var(--primary);
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border-radius: var(--radius-lg);
  border: 1.5px solid rgba(45, 27, 105, 0.08);
  background: var(--bg-card);
  cursor: pointer;
  box-shadow: var(--shadow-card);
  transition: var(--transition);
  font-family: inherit;
  text-align: left;
  color: inherit;
}

.grade-tab:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-md);
}

.grade-tab.is-active {
  background: linear-gradient(135deg, var(--accent), color-mix(in srgb, var(--accent) 62%, #fff));
  border-color: transparent;
  box-shadow: 0 12px 26px color-mix(in srgb, var(--accent) 42%, transparent);
  transform: translateY(-3px);
}

.grade-tab-emoji {
  font-size: 26px;
  width: 44px;
  height: 44px;
  flex-shrink: 0;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: color-mix(in srgb, var(--accent) 14%, transparent);
  transition: var(--transition);
}
.grade-tab.is-active .grade-tab-emoji {
  background: rgba(255, 255, 255, 0.24);
  transform: scale(1.06) rotate(-4deg);
}

.grade-tab-label {
  display: flex;
  flex-direction: column;
  line-height: 1.25;
}

.grade-tab-name {
  font-family: var(--font-display);
  font-size: 17px;
  font-weight: 600;
  letter-spacing: -0.01em;
  color: var(--text-primary);
  transition: color 0.25s var(--ease);
}
.grade-tab.is-active .grade-tab-name { color: #fff; }

.grade-tab-progress {
  font-size: 12px;
  font-weight: 500;
  color: var(--text-secondary);
  transition: color 0.25s var(--ease);
}
.grade-tab.is-active .grade-tab-progress { color: rgba(255, 255, 255, 0.88); }

/* ============================================
   GRADE CONTENT
   ============================================ */
.grade-content {
  --accent: var(--primary);
  animation: gradeIn 0.4s var(--ease);
}

.semester-grid {
  display: grid;
  gap: 18px;
}

.semester-panel {
  background: var(--bg-card);
  border-radius: var(--radius-xl);
  padding: 20px;
  box-shadow: var(--shadow-card);
  border: 1px solid rgba(45, 27, 105, 0.04);
}

.semester-head {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  padding-bottom: 14px;
  border-bottom: 1.5px dashed rgba(124, 92, 252, 0.14);
}

.semester-badge {
  font-size: 22px;
  width: 46px;
  height: 46px;
  display: grid;
  place-items: center;
  border-radius: var(--radius-md);
  background: color-mix(in srgb, var(--accent) 12%, transparent);
}

.semester-title {
  font-family: var(--font-display);
  font-size: 19px;
  font-weight: 600;
  letter-spacing: -0.01em;
  color: var(--text-primary);
}

.semester-meta {
  font-size: 12px;
  color: var(--text-secondary);
}

/* ============================================
   UNIT GRID — 关卡卡片
   ============================================ */
.unit-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.unit-card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 18px 12px 14px;
  border-radius: var(--radius-lg);
  background: var(--bg-card);
  border: 1.5px solid rgba(45, 27, 105, 0.06);
  box-shadow: var(--shadow-sm);
  text-decoration: none;
  text-align: center;
  transition: var(--transition);
  overflow: hidden;
  isolation: isolate;
}

/* 顶部彩条，hover 展开 */
.unit-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--accent), color-mix(in srgb, var(--accent) 50%, #fff));
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.32s var(--ease);
  z-index: 1;
}

.unit-card:hover {
  transform: translateY(-6px);
  box-shadow: var(--shadow-lg);
  border-color: color-mix(in srgb, var(--accent) 45%, transparent);
}
.unit-card:hover::before { transform: scaleX(1); }
.unit-card:active { transform: translateY(-3px) scale(0.99); }

.unit-badge {
  width: 54px;
  height: 54px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  font-family: var(--font-display);
  font-size: 22px;
  font-weight: 700;
  color: #fff;
  background: linear-gradient(135deg, var(--accent), color-mix(in srgb, var(--accent) 58%, #fff));
  box-shadow:
    0 6px 14px color-mix(in srgb, var(--accent) 38%, transparent),
    inset 0 1px 0 rgba(255, 255, 255, 0.5);
  transition: transform 0.3s var(--ease);
}
.unit-card:hover .unit-badge { transform: scale(1.08) rotate(-5deg); }

.unit-topic {
  font-size: 12.5px;
  font-weight: 500;
  line-height: 1.35;
  color: var(--text-primary);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 2.7em;
}

.unit-meta {
  font-size: 11px;
  color: var(--text-secondary);
}

.unit-stars {
  font-size: 10px;
  letter-spacing: 1px;
  min-height: 12px;
}

.unit-crown {
  position: absolute;
  top: 8px;
  right: 8px;
  font-size: 15px;
  filter: drop-shadow(0 1px 3px rgba(251, 191, 36, 0.5));
  z-index: 2;
}

/* 状态变体 */
.unit-card.is-mastered {
  border-color: rgba(251, 191, 36, 0.35);
  background: linear-gradient(180deg, rgba(251, 191, 36, 0.06), var(--bg-card) 60%);
}
.unit-card.is-mastered::before { transform: scaleX(1); background: linear-gradient(90deg, var(--amber), #FFE9A8); }

.unit-card.is-new .unit-badge::after {
  content: '';
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  border: 2px solid color-mix(in srgb, var(--accent) 50%, transparent);
  animation: pulseRing 2s ease-out infinite;
}
.unit-badge { position: relative; }

.unit-empty {
  padding: 24px;
  text-align: center;
  font-size: 13px;
  color: var(--text-light);
  border: 1.5px dashed rgba(124, 92, 252, 0.18);
  border-radius: var(--radius-lg);
}

@keyframes pulseRing {
  0% { transform: scale(0.9); opacity: 0.9; }
  100% { transform: scale(1.25); opacity: 0; }
}

@keyframes gradeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* ============================================
   RESPONSIVE
   ============================================ */
@media (min-width: 768px) {
  .hero { padding: 38px 34px 32px; }
  .hero-title { font-size: 38px; }
  .hero-sub { font-size: 15px; }

  .grade-tabs {
    grid-template-columns: repeat(4, 1fr);
    gap: 14px;
  }
  .grade-tab { padding: 16px 18px; }

  .unit-grid { grid-template-columns: repeat(3, 1fr); gap: 14px; }
  .unit-badge { width: 58px; height: 58px; font-size: 24px; }
  .unit-topic { font-size: 13px; }
}

@media (min-width: 1024px) {
  .semester-grid { grid-template-columns: repeat(2, 1fr); gap: 28px; align-items: start; }
  .semester-panel { padding: 26px 24px; }
  .unit-grid { gap: 16px; }
}

@media (min-width: 1440px) {
  .unit-grid { grid-template-columns: repeat(4, 1fr); gap: 18px; }
  .grade-tab { padding: 18px 20px; }
}
</style>
