<template>
  <div class="home-view">
    <!-- ============ HERO（已登录） ============ -->
    <header class="hero animate-slide-up" v-if="userStore.isLoggedIn">
      <span class="spark spark--1">✨</span>
      <span class="spark spark--2">⭐</span>
      <span class="spark spark--3">✨</span>
      <span class="spark spark--4">🌟</span>

      <div class="hero-inner">
        <div class="hero-greet">
          <span class="hero-emoji">{{ greetingEmoji }}</span>
          <div class="hero-greet-text">
            <h1 class="hero-title">{{ greetingText }}，{{ userStore.currentUser?.name }}！</h1>
            <p class="hero-streak" v-if="(userStore.currentUser?.stats?.streakDays || 0) > 1">
              🔥 已连续学习 {{ userStore.currentUser.stats.streakDays }} 天，继续保持！
            </p>
          </div>
        </div>

        <div class="hero-progress" v-if="totalWords">
          <div class="hero-progress-meta">
            <span class="hero-progress-label">词汇掌握度</span>
            <span class="hero-progress-num">{{ overallProgress }}<small>%</small></span>
          </div>
          <div class="hero-progress-track">
            <div class="hero-progress-fill" :style="{ width: overallProgress + '%' }"></div>
          </div>
          <div class="hero-progress-stats">已学 {{ userStore.learnedCount }} / {{ totalWords }} 词</div>
        </div>
      </div>
    </header>

    <!-- ============ HERO（访客） ============ -->
    <header class="hero hero--guest animate-slide-up" v-else>
      <span class="spark spark--1">✨</span>
      <span class="spark spark--2">⭐</span>
      <span class="spark spark--3">🌟</span>

      <div class="hero-inner hero-inner--center">
        <div class="hero-emoji hero-emoji--xl">👋</div>
        <h1 class="hero-title">欢迎来到英语小达人</h1>
        <p class="hero-sub">选择一个角色，开启属于你的单词魔法冒险 ✨</p>
        <router-link to="/user" class="hero-cta">🚀 选择角色</router-link>
      </div>
    </header>

    <!-- ============ 快速统计 ============ -->
    <div class="stats-row" v-if="userStore.isLoggedIn">
      <div class="stat-card animate-slide-up" style="animation-delay: 0.05s">
        <span class="stat-icon">📚</span>
        <span class="stat-value">{{ userStore.learnedCount }}</span>
        <span class="stat-label">已学单词</span>
      </div>
      <div class="stat-card animate-slide-up" style="animation-delay: 0.1s">
        <span class="stat-icon">🔁</span>
        <span class="stat-value">{{ userStore.wrongWordsCount }}</span>
        <span class="stat-label">待复习</span>
      </div>
      <div class="stat-card animate-slide-up" style="animation-delay: 0.15s">
        <span class="stat-icon">🎮</span>
        <span class="stat-value">{{ userStore.currentUser?.stats?.totalQuizCompleted || 0 }}</span>
        <span class="stat-label">闯关次数</span>
      </div>
    </div>

    <!-- ============ 冒险入口 ============ -->
    <div class="section-title">🎯 开始冒险</div>
    <div class="feature-grid">
      <router-link
        v-for="(f, i) in features"
        :key="f.to"
        :to="f.to"
        class="feature-card animate-slide-up"
        :style="{ '--accent': f.accent, animationDelay: `${0.1 + i * 0.07}s` }"
      >
        <span class="feature-medallion">{{ f.icon }}</span>
        <span class="feature-title">{{ f.title }}</span>
        <span class="feature-desc">{{ featureDesc(f) }}</span>
      </router-link>
    </div>

    <!-- ============ 今日推荐 ============ -->
    <div class="section-title">✨ 今日推荐</div>
    <div class="daily-words" v-if="dailyWords.length">
      <div
        class="daily-word-card"
        v-for="word in dailyWords"
        :key="word.id"
        @click="playWordSound(word)"
      >
        <button class="daily-play" aria-label="播放发音">🔊</button>
        <div class="daily-word-en">{{ word.english }}</div>
        <div class="daily-word-cn">{{ word.chinese }}</div>
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
const dailyWords = ref([])

// 冒险入口：每个入口一种语义强调色
const features = [
  { to: '/learn', icon: '📖', title: '单词学习', desc: '循序渐进学单词', accent: '#7C5CFC' },
  { to: '/quiz', icon: '🎮', title: '闯关挑战', desc: '游戏化单词测验', accent: '#2DD4BF' },
  { to: '/review', icon: '🔄', title: '错题复习', desc: '', accent: '#FBBF24' },
  { to: '/progress', icon: '🏆', title: '学习报告', desc: '查看学习进度', accent: '#60A5FA' }
]

function featureDesc(f) {
  if (f.to === '/review') {
    return userStore.wrongWordsCount > 0
      ? `${userStore.wrongWordsCount} 个单词待复习`
      : '暂无错题 🎉'
  }
  return f.desc
}

const totalWords = computed(() => vocabStore.words.length)
const overallProgress = computed(() => {
  if (!totalWords.value) return 0
  return Math.round((userStore.learnedCount / totalWords.value) * 100)
})

const greetingEmoji = computed(() => {
  const hour = new Date().getHours()
  if (hour < 6) return '🌙'
  if (hour < 12) return '🌅'
  if (hour < 18) return '☀️'
  return '🌆'
})

const greetingText = computed(() => {
  const hour = new Date().getHours()
  if (hour < 6) return '夜深了'
  if (hour < 12) return '早上好'
  if (hour < 18) return '下午好'
  return '晚上好'
})

function playWordSound(word) {
  const audio = new Audio(`/data/audio/words/word_${word.english.toLowerCase().replace(/ /g, '_').replace(/'/g, '').split('(')[0].trim()}.mp3`)
  audio.play().catch(() => {})
}

onMounted(async () => {
  await vocabStore.loadVocabulary()
  // 随机选 3 个今日推荐单词
  const allWords = vocabStore.words
  if (allWords.length) {
    const shuffled = [...allWords].sort(() => Math.random() - 0.5)
    dailyWords.value = shuffled.slice(0, 3)
  }
})
</script>

<style scoped>
.home-view { padding-bottom: 16px; }

/* ============================================
   HERO — 魔法夜空
   ============================================ */
.hero {
  position: relative;
  border-radius: var(--radius-2xl);
  padding: 28px 24px;
  margin-bottom: 24px;
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
    radial-gradient(1.2px 1.2px at 86% 62%, rgba(255, 255, 255, 0.75), transparent 60%),
    radial-gradient(1px 1px at 58% 38%, rgba(255, 255, 255, 0.5), transparent 60%),
    radial-gradient(1.4px 1.4px at 30% 88%, rgba(255, 255, 255, 0.6), transparent 60%);
  animation: twinkle 4.5s ease-in-out infinite alternate;
  z-index: -1;
}

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
.spark--1 { top: 16%; left: 8%; }
.spark--2 { top: 64%; left: 12%; font-size: 14px; animation-delay: 1.4s; }
.spark--3 { top: 24%; right: 12%; font-size: 16px; animation-delay: 0.7s; }
.spark--4 { top: 70%; right: 9%; animation-delay: 2.1s; }

.hero-inner { position: relative; z-index: 1; max-width: 560px; }
.hero-inner--center { max-width: 460px; margin: 0 auto; text-align: center; }

.hero-greet {
  display: flex;
  align-items: center;
  gap: 14px;
}

.hero-emoji {
  font-size: 46px;
  flex-shrink: 0;
  animation: float 3s ease-in-out infinite;
}
.hero-emoji--xl { font-size: 60px; margin-bottom: 10px; }

.hero-title {
  font-family: var(--font-display);
  font-size: clamp(22px, 4.6vw, 30px);
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.15;
  text-shadow: 0 2px 12px rgba(0, 0, 0, 0.18);
}

.hero-streak {
  margin-top: 4px;
  font-size: clamp(12px, 2.4vw, 14px);
  color: var(--text-on-dark-muted);
}

.hero-sub {
  margin-top: 8px;
  font-size: clamp(13px, 2.4vw, 15px);
  color: var(--text-on-dark-muted);
  line-height: 1.5;
}

/* hero 内进度胶囊 */
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

/* 访客 CTA：白丸，在紫渐变上最跳 */
.hero-cta {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-top: 20px;
  padding: 14px 30px;
  border-radius: var(--radius-full);
  background: #fff;
  color: var(--primary);
  font-family: var(--font-display);
  font-size: 16px;
  font-weight: 600;
  text-decoration: none;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18);
  transition: var(--transition);
}
.hero-cta:hover {
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.24);
}
.hero-cta:active { transform: translateY(0) scale(0.99); }

@keyframes twinkle {
  0% { opacity: 0.55; }
  100% { opacity: 1; }
}
@keyframes floatSpark {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-9px) rotate(12deg); }
}
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
}

/* ============================================
   STATS
   ============================================ */
.stats-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-bottom: 28px;
}

.stat-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: 16px 10px;
  text-align: center;
  box-shadow: var(--shadow-card);
  border: 1.5px solid rgba(124, 92, 252, 0.04);
  transition: var(--transition);
}
.stat-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-md);
  border-color: rgba(124, 92, 252, 0.12);
}

.stat-icon {
  font-size: 22px;
  width: 40px;
  height: 40px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: var(--primary-ghost);
  margin-bottom: 2px;
}

.stat-value {
  font-family: var(--font-display);
  font-size: clamp(22px, 5vw, 28px);
  font-weight: 700;
  color: var(--primary);
  letter-spacing: -0.02em;
}

.stat-label {
  font-size: 12px;
  font-weight: 500;
  color: var(--text-secondary);
}

/* ============================================
   FEATURES — 冒险入口
   ============================================ */
.feature-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 32px;
}

.feature-card {
  --accent: var(--primary);
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 24px 16px;
  border-radius: var(--radius-xl);
  background: var(--bg-card);
  border: 1.5px solid rgba(45, 27, 105, 0.05);
  box-shadow: var(--shadow-card);
  text-decoration: none;
  text-align: center;
  transition: var(--transition);
  overflow: hidden;
  isolation: isolate;
}

/* 顶部彩条，hover 展开 */
.feature-card::before {
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

.feature-card:hover {
  transform: translateY(-6px);
  box-shadow: var(--shadow-lg);
  border-color: color-mix(in srgb, var(--accent) 40%, transparent);
}
.feature-card:hover::before { transform: scaleX(1); }
.feature-card:active { transform: translateY(-3px) scale(0.99); }

.feature-medallion {
  font-size: 30px;
  width: 60px;
  height: 60px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--accent), color-mix(in srgb, var(--accent) 58%, #fff));
  box-shadow:
    0 6px 16px color-mix(in srgb, var(--accent) 38%, transparent),
    inset 0 1px 0 rgba(255, 255, 255, 0.5);
  margin-bottom: 6px;
  transition: transform 0.3s var(--ease);
}
.feature-card:hover .feature-medallion { transform: scale(1.08) rotate(-5deg); }

.feature-title {
  font-family: var(--font-display);
  font-size: 17px;
  font-weight: 600;
  letter-spacing: -0.01em;
  color: var(--text-primary);
}

.feature-desc {
  font-size: 12px;
  color: var(--text-secondary);
}

/* ============================================
   DAILY WORDS — 今日推荐
   ============================================ */
.daily-words {
  display: flex;
  gap: 10px;
  margin-bottom: 32px;
  overflow-x: auto;
  padding-bottom: 6px;
  scroll-snap-type: x mandatory;
}

.daily-word-card {
  position: relative;
  flex-shrink: 0;
  width: 160px;
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: 26px 16px 18px;
  text-align: center;
  box-shadow: var(--shadow-card);
  border: 1.5px solid rgba(124, 92, 252, 0.06);
  transition: var(--transition);
  cursor: pointer;
  scroll-snap-align: start;
  overflow: hidden;
}
.daily-word-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 4px;
  background: var(--bg-gradient);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.32s var(--ease);
}
.daily-word-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-md);
  border-color: var(--primary-light);
}
.daily-word-card:hover::before { transform: scaleX(1); }

.daily-play {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: none;
  background: var(--primary-ghost);
  cursor: pointer;
  font-size: 14px;
  transition: var(--transition);
}
.daily-play:hover { background: var(--bg-gradient); transform: scale(1.12); }

.daily-word-en {
  font-family: var(--font-display);
  font-size: 21px;
  font-weight: 600;
  color: var(--primary);
  letter-spacing: -0.01em;
}

.daily-word-cn {
  font-size: 13px;
  color: var(--text-secondary);
  margin-top: 4px;
}

/* ============================================
   RESPONSIVE
   ============================================ */
@media (min-width: 768px) {
  .hero { padding: 36px 32px; }
  .hero-emoji { font-size: 54px; }
  .hero-title { font-size: 32px; }

  .stats-row { gap: 16px; margin-bottom: 36px; }
  .stat-card { padding: 20px 14px; }
  .stat-icon { font-size: 26px; width: 48px; height: 48px; }
  .stat-value { font-size: 34px; }
  .stat-label { font-size: 14px; }

  .feature-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    margin-bottom: 40px;
  }
  .feature-card { padding: 28px 16px; }
  .feature-medallion { width: 68px; height: 68px; font-size: 34px; }
  .feature-title { font-size: 18px; }
  .feature-desc { font-size: 13px; }

  .daily-words { gap: 14px; }
  .daily-word-card { width: 190px; padding: 30px 18px 20px; }
  .daily-word-en { font-size: 24px; }
}

@media (min-width: 1024px) {
  .hero { padding: 40px 36px; }
  .hero-emoji { font-size: 60px; }
  .hero-title { font-size: 36px; }

  .stats-row { gap: 20px; }
  .stat-card { border-radius: var(--radius-xl); }
  .stat-value { font-size: 40px; }

  .feature-grid { gap: 20px; }
  .feature-card { padding: 34px 20px; border-radius: var(--radius-2xl); }
  .feature-medallion { width: 74px; height: 74px; font-size: 38px; }
  .feature-title { font-size: 20px; }

  /* 今日推荐：铺满整宽，3 张并排 */
  .daily-words {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    overflow-x: visible;
    gap: 16px;
  }
  .daily-word-card { width: 100%; padding: 32px 22px 22px; }
  .daily-word-en { font-size: 26px; }
  .daily-word-cn { font-size: 15px; }
  .daily-play { width: 36px; height: 36px; font-size: 16px; }
}

@media (min-width: 1440px) {
  .hero { padding: 44px 40px; }
  .stats-row { gap: 24px; margin-bottom: 44px; }
  .feature-grid { gap: 24px; margin-bottom: 44px; }
  .daily-words { gap: 24px; }
  }
</style>
