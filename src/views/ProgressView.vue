<template>
  <div class="progress-view">
    <!-- ============ PROFILE HERO ============ -->
    <header class="profile-hero hero animate-slide-up" v-if="userStore.currentUser">
      <span class="spark spark--1">✨</span>
      <span class="spark spark--2">⭐</span>
      <span class="spark spark--3">🌟</span>
      <div class="hero-inner">
        <div class="profile-head">
          <span class="profile-avatar">{{ userStore.currentUser.avatar }}</span>
          <div class="profile-info">
            <h1 class="hero-title">{{ userStore.currentUser.name }}</h1>
            <p class="hero-sub">加入于 {{ formatDate(userStore.currentUser.createdAt) }}</p>
          </div>
        </div>
        <div class="profile-stats">
          <div class="p-stat">
            <span class="p-stat-value">🔥 {{ userStore.currentUser.stats?.streakDays || 0 }}</span>
            <span class="p-stat-label">连续天数</span>
          </div>
          <div class="p-stat">
            <span class="p-stat-value">⭐ {{ userStore.currentUser.stats?.totalPoints || 0 }}</span>
            <span class="p-stat-label">总积分</span>
          </div>
          <div class="p-stat">
            <span class="p-stat-value">📚 {{ userStore.learnedCount }}</span>
            <span class="p-stat-label">已学单词</span>
          </div>
          <div class="p-stat">
            <span class="p-stat-value">🎮 {{ userStore.currentUser.stats?.totalQuizCompleted || 0 }}</span>
            <span class="p-stat-label">闯关次数</span>
          </div>
        </div>
      </div>
    </header>

    <!-- ============ 学习进度 ============ -->
    <div class="section-title">📈 学习进度</div>
    <div class="progress-section">
      <div
        class="progress-card"
        v-for="grade in grades"
        :key="grade.num"
        :style="{ '--accent': grade.accent }"
      >
        <div class="progress-card-head">
          <span class="progress-card-name">{{ grade.emoji }} {{ grade.name }}</span>
          <span class="progress-percent">{{ getGradeProgress(grade.num) }}%</span>
        </div>
        <div class="progress-bar">
          <div class="fill" :style="{ width: getGradeProgress(grade.num) + '%' }"></div>
        </div>
        <div class="progress-detail">{{ getLearnedInGrade(grade.num) }} / {{ getWordsInGrade(grade.num) }} 词</div>
      </div>
    </div>

    <!-- ============ 成就 ============ -->
    <div class="section-title">🏅 成就</div>
    <div class="achievements">
      <div
        class="achievement"
        :class="{ unlocked: isAchievementUnlocked(a) }"
        v-for="a in achievements"
        :key="a.id"
      >
        <span class="achievement-icon">{{ a.icon }}</span>
        <div class="achievement-info">
          <span class="achievement-name">{{ a.name }}</span>
          <span class="achievement-desc">{{ a.desc }}</span>
        </div>
      </div>
    </div>

    <!-- ============ 切换用户 ============ -->
    <div class="user-actions">
      <router-link to="/user" class="btn btn-outline btn-block">🔄 切换角色</router-link>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useUserStore } from '../stores/user'
import { useVocabularyStore } from '../stores/vocabulary'

const userStore = useUserStore()
const vocabStore = useVocabularyStore()

// 年级配色与 LearnView 保持一致
const grades = [
  { num: 3, name: '三年级', emoji: '🌱', accent: '#2DD4BF' },
  { num: 4, name: '四年级', emoji: '🌿', accent: '#60A5FA' },
  { num: 5, name: '五年级', emoji: '🌳', accent: '#FBBF24' },
  { num: 6, name: '六年级', emoji: '🌲', accent: '#FB7185' }
]

const achievements = [
  { id: 'first_word', icon: '📖', name: '初学者', desc: '学习第一个单词', check: () => userStore.learnedCount >= 1 },
  { id: 'ten_words', icon: '🌟', name: '小书虫', desc: '学习10个单词', check: () => userStore.learnedCount >= 10 },
  { id: 'fifty_words', icon: '🔥', name: '学习达人', desc: '学习50个单词', check: () => userStore.learnedCount >= 50 },
  { id: 'hundred_words', icon: '🏆', name: '词汇大师', desc: '学习100个单词', check: () => userStore.learnedCount >= 100 },
  { id: 'first_quiz', icon: '🎮', name: '初次闯关', desc: '完成第一次闯关', check: () => (userStore.currentUser?.stats?.totalQuizCompleted || 0) >= 1 },
  { id: 'perfect_quiz', icon: '💯', name: '满分王者', desc: '闯关获得满分', check: () => {
    const progress = userStore.currentUser?.progress || {}
    return Object.values(progress).some(p => p.bestScore === p.lastTotal)
  }},
  { id: 'streak_3', icon: '🔥', name: '三天打鱼', desc: '连续学习3天', check: () => (userStore.currentUser?.stats?.streakDays || 0) >= 3 },
  { id: 'streak_7', icon: '💎', name: '一周坚持', desc: '连续学习7天', check: () => (userStore.currentUser?.stats?.streakDays || 0) >= 7 },
]

function formatDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('zh-CN')
}

function getGradeProgress(grade) {
  const words = vocabStore.getWordsByGradeSemester(grade, 1)
    .concat(vocabStore.getWordsByGradeSemester(grade, 2))
  if (!words.length) return 0
  const learned = words.filter(w => userStore.currentUser?.learnedWords?.includes(w.id))
  return Math.round((learned.length / words.length) * 100)
}

function getLearnedInGrade(grade) {
  const words = vocabStore.getWordsByGradeSemester(grade, 1)
    .concat(vocabStore.getWordsByGradeSemester(grade, 2))
  return words.filter(w => userStore.currentUser?.learnedWords?.includes(w.id)).length
}

function getWordsInGrade(grade) {
  return vocabStore.getWordsByGradeSemester(grade, 1).length +
    vocabStore.getWordsByGradeSemester(grade, 2).length
}

function isAchievementUnlocked(achievement) {
  return achievement.check()
}

onMounted(() => {
  vocabStore.loadVocabulary()
})
</script>

<style scoped>
/* ============================================
   PROFILE HERO
   ============================================ */
.hero {
  position: relative;
  border-radius: var(--radius-2xl);
  padding: 26px 24px;
  margin-bottom: 26px;
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
    radial-gradient(1px 1px at 58% 38%, rgba(255, 255, 255, 0.5), transparent 60%);
  animation: twinkle 4.5s ease-in-out infinite alternate;
  z-index: -1;
}
.hero::after {
  content: '';
  position: absolute;
  right: -70px; top: -70px;
  width: 230px; height: 230px;
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
.hero-inner { position: relative; z-index: 1; }

.profile-head { display: flex; align-items: center; gap: 16px; margin-bottom: 18px; }
.profile-avatar {
  font-size: 44px;
  width: 64px; height: 64px;
  flex-shrink: 0;
  display: grid; place-items: center;
  background: rgba(255, 255, 255, 0.18);
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  backdrop-filter: blur(4px);
}
.hero-title {
  font-family: var(--font-display);
  font-size: clamp(22px, 4.6vw, 30px);
  font-weight: 700;
  letter-spacing: -0.02em;
  text-shadow: 0 2px 12px rgba(0, 0, 0, 0.18);
}
.hero-sub { margin-top: 2px; font-size: clamp(12px, 2.4vw, 14px); color: var(--text-on-dark-muted); }

.profile-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  padding: 14px;
  border-radius: var(--radius-lg);
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.16);
  backdrop-filter: blur(6px);
}
.p-stat { text-align: center; }
.p-stat-value {
  display: block;
  font-family: var(--font-display);
  font-size: clamp(15px, 3vw, 19px);
  font-weight: 700;
  color: #fff;
  letter-spacing: -0.01em;
}
.p-stat-label { font-size: 11px; color: var(--text-on-dark-muted); }

@keyframes twinkle { 0% { opacity: 0.55; } 100% { opacity: 1; } }
@keyframes floatSpark { 0%, 100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-9px) rotate(12deg); } }

/* ============================================
   学习进度
   ============================================ */
.progress-section { display: flex; flex-direction: column; gap: 10px; margin-bottom: 28px; }
.progress-card {
  --accent: var(--primary);
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: 15px 18px;
  box-shadow: var(--shadow-card);
  border: 1px solid rgba(45, 27, 105, 0.04);
  transition: var(--transition);
}
.progress-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-md); }

.progress-card-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 9px;
  font-weight: 600;
  font-size: 15px;
  color: var(--text-primary);
}
.progress-percent {
  font-family: var(--font-display);
  color: var(--accent);
  font-weight: 700;
  letter-spacing: -0.01em;
}

.progress-bar {
  height: 9px;
  background: var(--primary-ghost);
  border-radius: var(--radius-full);
  overflow: hidden;
}
.progress-bar .fill {
  height: 100%;
  background: linear-gradient(90deg, var(--accent), color-mix(in srgb, var(--accent) 55%, #fff));
  border-radius: var(--radius-full);
  transition: width 0.7s var(--ease);
}
.progress-detail { font-size: 12px; color: var(--text-secondary); margin-top: 6px; }

/* ============================================
   成就
   ============================================ */
.achievements { display: flex; flex-direction: column; gap: 8px; margin-bottom: 24px; }
.achievement {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 13px 16px;
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-card);
  border: 1px solid rgba(45, 27, 105, 0.04);
  opacity: 0.45;
  filter: grayscale(1);
  transition: var(--transition);
}
.achievement.unlocked {
  opacity: 1;
  filter: grayscale(0);
  border-color: rgba(251, 191, 36, 0.25);
  background: linear-gradient(180deg, rgba(251, 191, 36, 0.05), var(--bg-card) 60%);
}
.achievement.unlocked:hover { transform: translateY(-2px); box-shadow: var(--shadow-md); }

.achievement-icon {
  font-size: 28px;
  width: 46px; height: 46px;
  flex-shrink: 0;
  display: grid; place-items: center;
  border-radius: var(--radius-md);
  background: var(--primary-ghost);
}
.achievement.unlocked .achievement-icon { background: var(--amber-light); }
.achievement-info { display: flex; flex-direction: column; }
.achievement-name { font-size: 15px; font-weight: 600; color: var(--text-primary); }
.achievement-desc { font-size: 12px; color: var(--text-secondary); }

.user-actions { margin-top: 16px; }

/* ============================================
   RESPONSIVE
   ============================================ */
@media (min-width: 768px) {
  .hero { padding: 34px 32px; }
  .profile-avatar { font-size: 52px; width: 76px; height: 76px; }
  .hero-title { font-size: 32px; }
  .p-stat-value { font-size: 22px; }
  .p-stat-label { font-size: 13px; }

  .progress-card { padding: 18px 22px; }
  .progress-card-head { font-size: 17px; }

  .achievements { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
  .achievement { padding: 16px 20px; }
  .achievement-icon { font-size: 32px; }
}

@media (min-width: 1024px) {
  .progress-section { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; }
  .progress-card { padding: 20px 24px; border-radius: var(--radius-xl); }

  .achievements { grid-template-columns: repeat(4, 1fr); gap: 14px; }
  .achievement { padding: 18px 20px; border-radius: var(--radius-lg); }
  .achievement-icon { font-size: 36px; width: 52px; height: 52px; }
}

@media (min-width: 1440px) {
  .achievements { grid-template-columns: repeat(4, 1fr); gap: 16px; }
  .progress-section { grid-template-columns: repeat(4, 1fr); }
  .profile-stats { gap: 16px; }
}
</style>
