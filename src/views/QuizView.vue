<template>
  <div class="quiz-view">
    <!-- ============ 开始界面 ============ -->
    <div class="quiz-start" v-if="!quizStarted">
      <header class="quiz-hero hero animate-slide-up">
        <span class="spark spark--1">✨</span>
        <span class="spark spark--2">⭐</span>
        <span class="spark spark--3">🌟</span>
        <div class="hero-inner hero-inner--center">
          <div class="hero-emoji hero-emoji--xl animate-bounce-in">🎮</div>
          <h1 class="hero-title">单词闯关</h1>
          <p class="hero-sub">听发音选单词，看看你能摘到几颗星 ⭐</p>
        </div>
      </header>

      <div class="quiz-setup animate-slide-up" style="animation-delay:.1s">
        <div class="option-group">
          <label class="option-label">难度</label>
          <div class="segmented">
            <button
              class="seg-btn"
              :class="{ active: difficulty === d.key }"
              :style="difficulty === d.key ? { '--accent': d.accent } : {}"
              v-for="d in difficulties"
              :key="d.key"
              @click="difficulty = d.key"
            >
              {{ d.label }}
            </button>
          </div>
        </div>

        <div class="option-group">
          <label class="option-label">题目数量</label>
          <div class="segmented">
            <button
              class="seg-btn"
              :class="{ active: questionCount === n }"
              v-for="n in questionCounts"
              :key="n"
              @click="questionCount = n"
            >
              {{ n }} 题
            </button>
          </div>
        </div>

        <button class="btn btn-primary btn-lg btn-block" @click="startQuiz">
          🚀 开始闯关
        </button>
      </div>
    </div>

    <!-- ============ 答题界面 ============ -->
    <div class="quiz-game" v-if="quizStarted && !quizFinished">
      <div class="quiz-top-bar">
        <span class="question-num">第 <b>{{ currentQuestion + 1 }}</b><small>/{{ questions.length }}</small> 题</span>
        <div class="score-display">
          <span class="score-pill score-correct">✅ {{ correctCount }}</span>
          <span class="score-pill score-wrong">❌ {{ wrongCount }}</span>
        </div>
      </div>

      <div class="progress-bar">
        <div class="fill" :style="{ width: ((currentQuestion + 1) / questions.length * 100) + '%' }"></div>
      </div>

      <div class="quiz-question animate-slide-up" :key="currentQuestion">
        <div class="quiz-audio-section">
          <button class="big-play-btn" :class="{ playing: audioIsPlaying }" @click="playQuestionAudio">
            🔊
          </button>
          <p class="audio-hint">点击播放，听发音选单词</p>
        </div>

        <div class="quiz-options-list">
          <button
            class="quiz-option"
            :class="{
              correct: selectedAnswer !== null && option.id === correctAnswer.id,
              wrong: selectedAnswer === option.id && option.id !== correctAnswer.id,
              disabled: selectedAnswer !== null
            }"
            v-for="option in currentOptions"
            :key="option.id"
            @click="selectAnswer(option)"
            :disabled="selectedAnswer !== null"
          >
            <span class="option-en">{{ option.english }}</span>
            <span class="option-cn">{{ option.chinese }}</span>
          </button>
        </div>

        <div class="answer-feedback" v-if="selectedAnswer !== null" :class="isCorrect ? 'correct' : 'wrong'">
          <span class="feedback-emoji">{{ isCorrect ? '🎉' : '😅' }}</span>
          <span class="feedback-text">{{ isCorrect ? '答对了！太棒了！' : `正确答案：${correctAnswer.english}` }}</span>
          <button class="btn btn-primary btn-sm" @click="nextQuestion">
            {{ currentQuestion < questions.length - 1 ? '下一题 →' : '查看结果' }}
          </button>
        </div>
      </div>
    </div>

    <!-- ============ 结果界面 ============ -->
    <div class="quiz-result" v-if="quizFinished">
      <header class="result-hero hero animate-bounce-in">
        <span class="spark spark--1">✨</span>
        <span class="spark spark--2">⭐</span>
        <span class="spark spark--3">🎉</span>
        <div class="hero-inner hero-inner--center">
          <div class="hero-emoji hero-emoji--xl">{{ resultEmoji }}</div>
          <h1 class="hero-title">{{ resultText }}</h1>
          <div class="result-score">
            <span class="score-number">{{ correctCount }}</span>
            <span class="score-total">/{{ questions.length }}</span>
          </div>
          <div class="result-stars">
            <span class="star" :class="{ active: i <= starCount }" v-for="i in 3" :key="i">⭐</span>
          </div>
        </div>
      </header>

      <div class="result-details card">
        <div class="result-stat">
          <span class="stat-icon">⏱️</span>
          <span>用时 {{ elapsedTime }} 秒</span>
        </div>
        <div class="result-stat">
          <span class="stat-icon">⭐</span>
          <span>获得 {{ earnedPoints }} 积分</span>
        </div>
      </div>

      <div class="wrong-words card" v-if="wrongAnswers.length">
        <h3>📝 需要加油的单词</h3>
        <div class="wrong-word" v-for="w in wrongAnswers" :key="w.id">
          <span class="wrong-en">{{ w.english }}</span>
          <span class="wrong-cn">{{ w.chinese }}</span>
        </div>
      </div>

      <div class="result-actions">
        <button class="btn btn-outline" @click="resetQuiz">🔄 再来一次</button>
        <router-link to="/review" class="btn btn-primary">📖 复习错题</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useVocabularyStore } from '../stores/vocabulary'
import { useUserStore } from '../stores/user'
import { useAudio } from '../composables/useAudio'

const vocabStore = useVocabularyStore()
const userStore = useUserStore()
const { isPlaying: audioIsPlaying, playWord: doPlayWord } = useAudio()

const difficulties = [
  { key: 'easy', label: '🌱 简单', accent: '#2DD4BF' },
  { key: 'medium', label: '🌿 中等', accent: '#FBBF24' },
  { key: 'hard', label: '🌳 困难', accent: '#FB7185' }
]
const questionCounts = [10, 20, 30]

const difficulty = ref('easy')
const questionCount = ref(10)
const quizStarted = ref(false)
const quizFinished = ref(false)
const currentQuestion = ref(0)
const questions = ref([])
const currentOptions = ref([])
const correctAnswer = ref(null)
const selectedAnswer = ref(null)
const correctCount = ref(0)
const wrongCount = ref(0)
const wrongAnswers = ref([])
const startTime = ref(0)
const elapsedTime = ref(0)
const isCorrect = ref(false)

const starCount = computed(() => {
  const ratio = correctCount.value / questions.value.length
  if (ratio >= 0.9) return 3
  if (ratio >= 0.7) return 2
  if (ratio >= 0.5) return 1
  return 0
})

const resultEmoji = computed(() => {
  if (starCount.value === 3) return '🏆'
  if (starCount.value === 2) return '🌟'
  if (starCount.value === 1) return '💪'
  return '📚'
})

const resultText = computed(() => {
  if (starCount.value === 3) return '太厉害了！满分达人！'
  if (starCount.value === 2) return '很不错！继续加油！'
  if (starCount.value === 1) return '还不错，再练练！'
  return '多复习一下再来吧！'
})

const earnedPoints = computed(() => {
  return Math.floor(correctCount.value / questions.value.length * 10)
})

function startQuiz() {
  vocabStore.loadVocabulary().then(() => {
    const allWords = [...vocabStore.words]
    const shuffled = allWords.sort(() => Math.random() - 0.5)
    const selected = shuffled.slice(0, Math.min(questionCount.value, shuffled.length))

    questions.value = selected.map(word => {
      const optionCount = difficulty.value === 'easy' ? 3 : 4
      const wrongOptions = allWords
        .filter(w => w.id !== word.id)
        .sort(() => Math.random() - 0.5)
        .slice(0, optionCount - 1)

      const options = [...wrongOptions, word].sort(() => Math.random() - 0.5)
      return { word, options }
    })

    currentQuestion.value = 0
    correctCount.value = 0
    wrongCount.value = 0
    wrongAnswers.value = []
    quizStarted.value = true
    quizFinished.value = false
    startTime.value = Date.now()
    loadQuestion()
  })
}

function loadQuestion() {
  const q = questions.value[currentQuestion.value]
  correctAnswer.value = q.word
  currentOptions.value = q.options
  selectedAnswer.value = null
  isCorrect.value = false

  // 自动播放音频
  setTimeout(() => playQuestionAudio(), 500)
}

function playQuestionAudio() {
  if (!correctAnswer.value) return
  doPlayWord(correctAnswer.value.id)
}

function selectAnswer(option) {
  if (selectedAnswer.value !== null) return
  selectedAnswer.value = option.id
  isCorrect.value = option.id === correctAnswer.value.id

  if (isCorrect.value) {
    correctCount.value++
    userStore.removeWrongWord(correctAnswer.value.id)
  } else {
    wrongCount.value++
    wrongAnswers.value.push(correctAnswer.value)
    userStore.addWrongWord(correctAnswer.value.id)
  }
}

function nextQuestion() {
  if (currentQuestion.value < questions.value.length - 1) {
    currentQuestion.value++
    loadQuestion()
  } else {
    elapsedTime.value = Math.round((Date.now() - startTime.value) / 1000)
    quizFinished.value = true
    userStore.recordQuizResult(3, 1, 1, correctCount.value, questions.value.length)
  }
}

function resetQuiz() {
  quizStarted.value = false
  quizFinished.value = false
}

onMounted(() => {
  vocabStore.loadVocabulary()
})
</script>

<style scoped>
/* ============================================
   HERO（共用魔法夜空）
   ============================================ */
.hero {
  position: relative;
  border-radius: var(--radius-2xl);
  padding: 32px 24px;
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
    radial-gradient(1.2px 1.2px at 86% 62%, rgba(255, 255, 255, 0.75), transparent 60%),
    radial-gradient(1px 1px at 58% 38%, rgba(255, 255, 255, 0.5), transparent 60%);
  animation: twinkle 4.5s ease-in-out infinite alternate;
  z-index: -1;
}
.hero::after {
  content: '';
  position: absolute;
  right: -70px;
  top: -70px;
  width: 230px;
  height: 230px;
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
.spark--2 { top: 66%; left: 12%; font-size: 14px; animation-delay: 1.4s; }
.spark--3 { top: 24%; right: 12%; font-size: 16px; animation-delay: 0.7s; }

.hero-inner { position: relative; z-index: 1; }
.hero-inner--center { text-align: center; }

.hero-emoji { font-size: 46px; animation: float 3s ease-in-out infinite; display: inline-block; }
.hero-emoji--xl { font-size: 64px; margin-bottom: 6px; }

.hero-title {
  font-family: var(--font-display);
  font-size: clamp(24px, 5vw, 32px);
  font-weight: 700;
  letter-spacing: -0.02em;
  text-shadow: 0 2px 12px rgba(0, 0, 0, 0.18);
}
.hero-sub {
  margin-top: 6px;
  font-size: clamp(13px, 2.4vw, 15px);
  color: var(--text-on-dark-muted);
}

@keyframes twinkle { 0% { opacity: 0.55; } 100% { opacity: 1; } }
@keyframes floatSpark { 0%, 100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-9px) rotate(12deg); } }
@keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }

/* ============================================
   设置区
   ============================================ */
.quiz-setup {
  background: var(--bg-card);
  border-radius: var(--radius-xl);
  padding: 22px 20px;
  box-shadow: var(--shadow-card);
  border: 1px solid rgba(45, 27, 105, 0.04);
}

.option-group { margin-bottom: 18px; }
.option-label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 10px;
}

.segmented {
  display: flex;
  gap: 8px;
  background: var(--primary-ghost);
  padding: 4px;
  border-radius: var(--radius-lg);
}
.seg-btn {
  --accent: var(--primary);
  flex: 1;
  padding: 11px 8px;
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
.seg-btn:hover { color: var(--text-primary); }
.seg-btn.active {
  background: linear-gradient(135deg, var(--accent), color-mix(in srgb, var(--accent) 62%, #fff));
  color: #fff;
  box-shadow: 0 6px 16px color-mix(in srgb, var(--accent) 38%, transparent);
}

/* ============================================
   答题区
   ============================================ */
.quiz-top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}
.question-num {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}
.question-num b { font-family: var(--font-display); font-size: 18px; color: var(--primary); }
.question-num small { color: var(--text-light); font-weight: 500; }

.score-display { display: flex; gap: 8px; }
.score-pill {
  padding: 5px 12px;
  border-radius: var(--radius-full);
  font-size: 13px;
  font-weight: 600;
}
.score-correct { background: var(--teal-light); color: #0D9488; }
.score-wrong { background: var(--coral-light); color: #E11D48; }

.quiz-audio-section { text-align: center; padding: 22px 0 18px; }
.big-play-btn {
  width: 84px;
  height: 84px;
  border-radius: 50%;
  border: none;
  background: var(--bg-gradient);
  color: #fff;
  font-size: 36px;
  cursor: pointer;
  transition: var(--transition);
  box-shadow: 0 8px 24px rgba(124, 92, 252, 0.36);
}
.big-play-btn:hover { transform: scale(1.08); box-shadow: var(--shadow-glow); }
.big-play-btn.playing { animation: pulse-glow 1.2s ease infinite; }
.audio-hint { color: var(--text-secondary); font-size: 13px; margin-top: 12px; }

.quiz-options-list { display: flex; flex-direction: column; gap: 10px; margin-bottom: 14px; }
.quiz-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border: 2px solid rgba(124, 92, 252, 0.1);
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: var(--transition);
  font-family: var(--font-body);
}
.quiz-option:hover:not(.disabled) {
  border-color: var(--primary-light);
  transform: translateX(4px);
  box-shadow: var(--shadow-md);
}
.quiz-option.correct { border-color: var(--teal); background: var(--teal-light); }
.quiz-option.wrong { border-color: var(--coral); background: var(--coral-light); animation: shake 0.5s ease; }
.quiz-option.disabled { cursor: default; }
.option-en { font-family: var(--font-display); font-size: 18px; font-weight: 600; letter-spacing: -0.01em; color: var(--text-primary); }
.option-cn { font-size: 14px; color: var(--text-secondary); }

.answer-feedback {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 13px 16px;
  border-radius: var(--radius-lg);
  font-size: 14px;
  flex-wrap: wrap;
}
.answer-feedback.correct { background: var(--teal-light); color: #0D9488; }
.answer-feedback.wrong { background: var(--coral-light); color: #E11D48; }
.answer-feedback .btn { margin-left: auto; }
.feedback-emoji { font-size: 20px; }

/* ============================================
   结果区
   ============================================ */
.result-score { margin: 14px 0 10px; }
.score-number {
  font-family: var(--font-display);
  font-size: 56px;
  font-weight: 700;
  color: #fff;
  letter-spacing: -0.02em;
}
.score-total { font-family: var(--font-display); font-size: 26px; color: var(--text-on-dark-muted); }

.result-stars { display: flex; justify-content: center; gap: 10px; }
.result-stars .star { font-size: 34px; opacity: 0.3; transition: opacity 0.3s var(--ease), transform 0.3s var(--ease); }
.result-stars .star.active { opacity: 1; animation: bounce-in 0.5s var(--ease); }

.result-details {
  display: flex;
  justify-content: space-around;
  padding: 16px;
  margin-bottom: 14px;
}
.result-stat { display: flex; align-items: center; gap: 8px; font-size: 14px; color: var(--text-secondary); }
.stat-icon { font-size: 20px; }

.wrong-words { margin-bottom: 14px; }
.wrong-words h3 { font-size: 16px; font-weight: 600; margin-bottom: 12px; }
.wrong-word { display: flex; justify-content: space-between; padding: 9px 0; border-bottom: 1px solid rgba(45, 27, 105, 0.06); }
.wrong-en { font-family: var(--font-display); font-weight: 600; color: var(--coral); }
.wrong-cn { color: var(--text-secondary); font-size: 14px; }

.result-actions { display: flex; gap: 12px; }
.result-actions .btn { flex: 1; }

/* ============================================
   RESPONSIVE
   ============================================ */
@media (min-width: 768px) {
  .hero { padding: 40px 32px; }
  .hero-emoji--xl { font-size: 84px; }
  .hero-title { font-size: 34px; }

  .quiz-setup { padding: 28px 28px; }
  .seg-btn { padding: 14px; font-size: 16px; }

  .big-play-btn { width: 104px; height: 104px; font-size: 44px; }
  .quiz-option { padding: 20px 24px; }
  .option-en { font-size: 22px; }
  .option-cn { font-size: 16px; }

  .score-number { font-size: 68px; }
  .result-stars .star { font-size: 42px; }
}

@media (min-width: 1024px) {
  .quiz-start, .quiz-game, .quiz-result { max-width: 680px; margin-left: auto; margin-right: auto; }

  .quiz-option { padding: 24px 28px; }
  .option-en { font-size: 24px; }

  .big-play-btn { width: 120px; height: 120px; font-size: 52px; }
  .quiz-audio-section { padding: 32px 0 22px; }
  .score-number { font-size: 76px; }
}

@media (min-width: 1440px) {
  .quiz-start, .quiz-game, .quiz-result { max-width: 780px; }
  .quiz-option { padding: 26px 30px; }
  .option-en { font-size: 26px; }
}
</style>
