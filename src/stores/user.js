import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const STORAGE_KEY = 'ps_english_users'
const CURRENT_USER_KEY = 'currentUser'

export const useUserStore = defineStore('user', () => {
  const currentUser = ref(null)
  const allUsers = ref([])

  // 从 localStorage 加载
  function loadUsers() {
    try {
      const data = localStorage.getItem(STORAGE_KEY)
      allUsers.value = data ? JSON.parse(data) : []
      const currentId = localStorage.getItem(CURRENT_USER_KEY)
      if (currentId) {
        currentUser.value = allUsers.value.find(u => u.id === currentId) || null
      }
    } catch {
      allUsers.value = []
      currentUser.value = null
    }
  }

  // 保存到 localStorage
  function saveUsers() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allUsers.value))
  }

  // 创建用户
  function createUser(name, avatar) {
    const user = {
      id: Date.now().toString(),
      name,
      avatar: avatar || '🧒',
      createdAt: new Date().toISOString(),
      progress: {},
      stats: {
        totalWordsLearned: 0,
        totalQuizCompleted: 0,
        streakDays: 0,
        lastStudyDate: null,
        totalPoints: 0
      },
      wrongWords: [],     // 错题集
      learnedWords: []     // 已学过的单词ID
    }
    allUsers.value.push(user)
    saveUsers()
    return user
  }

  // 选择当前用户
  function selectUser(userId) {
    const user = allUsers.value.find(u => u.id === userId)
    if (user) {
      currentUser.value = user
      localStorage.setItem(CURRENT_USER_KEY, userId)
    }
  }

  // 切换用户
  function switchUser(userId) {
    selectUser(userId)
  }

  // 删除用户
  function deleteUser(userId) {
    allUsers.value = allUsers.value.filter(u => u.id !== userId)
    if (currentUser.value?.id === userId) {
      currentUser.value = null
      localStorage.removeItem(CURRENT_USER_KEY)
    }
    saveUsers()
  }

  // 标记单词已学习
  function markWordLearned(wordId) {
    if (!currentUser.value) return
    if (!currentUser.value.learnedWords.includes(wordId)) {
      currentUser.value.learnedWords.push(wordId)
      currentUser.value.stats.totalWordsLearned++
      updateStudyStreak()
      saveUsers()
    }
  }

  // 添加错题
  function addWrongWord(wordId) {
    if (!currentUser.value) return
    const wrongWords = currentUser.value.wrongWords
    const existing = wrongWords.find(w => w.wordId === wordId)
    if (existing) {
      existing.count++
      existing.lastWrong = new Date().toISOString()
    } else {
      wrongWords.push({
        wordId,
        count: 1,
        lastWrong: new Date().toISOString()
      })
    }
    saveUsers()
  }

  // 移除错题（答对了）
  function removeWrongWord(wordId) {
    if (!currentUser.value) return
    currentUser.value.wrongWords = currentUser.value.wrongWords.filter(w => w.wordId !== wordId)
    saveUsers()
  }

  // 增加积分
  function addPoints(points) {
    if (!currentUser.value) return
    currentUser.value.stats.totalPoints += points
    saveUsers()
  }

  // 更新学习连续天数
  function updateStudyStreak() {
    if (!currentUser.value) return
    const today = new Date().toDateString()
    const lastStudy = currentUser.value.stats.lastStudyDate

    if (lastStudy !== today) {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      if (lastStudy === yesterday.toDateString()) {
        currentUser.value.stats.streakDays++
      } else if (lastStudy !== today) {
        currentUser.value.stats.streakDays = 1
      }
      currentUser.value.stats.lastStudyDate = today
    }
  }

  // 记录测验完成
  function recordQuizResult(grade, semester, unit, score, total) {
    if (!currentUser.value) return
    const key = `${grade}-${semester}-${unit}`
    currentUser.value.progress[key] = {
      ...(currentUser.value.progress[key] || {}),
      lastScore: score,
      lastTotal: total,
      lastDate: new Date().toISOString(),
      attempts: (currentUser.value.progress[key]?.attempts || 0) + 1,
      bestScore: Math.max(currentUser.value.progress[key]?.bestScore || 0, score)
    }
    currentUser.value.stats.totalQuizCompleted++
    addPoints(Math.floor(score / total * 10))
    saveUsers()
  }

  // 获取某单元进度
  function getUnitProgress(grade, semester, unit) {
    if (!currentUser.value) return null
    const key = `${grade}-${semester}-${unit}`
    return currentUser.value.progress[key] || null
  }

  const isLoggedIn = computed(() => !!currentUser.value)
  const learnedCount = computed(() => currentUser.value?.learnedWords?.length || 0)
  const wrongWordsCount = computed(() => currentUser.value?.wrongWords?.length || 0)

  return {
    currentUser,
    allUsers,
    isLoggedIn,
    learnedCount,
    wrongWordsCount,
    loadUsers,
    createUser,
    selectUser,
    switchUser,
    deleteUser,
    markWordLearned,
    addWrongWord,
    removeWrongWord,
    addPoints,
    recordQuizResult,
    getUnitProgress
  }
})
