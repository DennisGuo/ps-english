import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useVocabularyStore = defineStore('vocabulary', () => {
  const words = ref([])
  const topics = ref({})
  const loaded = ref(false)
  const loading = ref(false)

  async function loadVocabulary() {
    if (loaded.value || loading.value) return

    loading.value = true
    try {
      const [vocabRes, topicsRes] = await Promise.all([
        fetch('/data/words/vocabulary.json'),
        fetch('/data/words/topics.json')
      ])

      const vocabData = await vocabRes.json()
      const topicsData = await topicsRes.json()

      words.value = vocabData.words
      topics.value = topicsData.topics
      loaded.value = true
    } catch (e) {
      console.error('加载词汇数据失败:', e)
    } finally {
      loading.value = false
    }
  }

  function getWordsByGradeSemester(grade, semester) {
    return words.value.filter(w => w.grade === grade && w.semester === semester)
  }

  function getWordsByUnit(grade, semester, unit) {
    return words.value.filter(
      w => w.grade === grade && w.semester === semester && w.unit === unit
    )
  }

  function getWordById(id) {
    return words.value.find(w => w.id === id)
  }

  function getUnitsForGradeSemester(grade, semester) {
    const unitSet = new Set()
    words.value
      .filter(w => w.grade === grade && w.semester === semester)
      .forEach(w => unitSet.add(w.unit))
    return Array.from(unitSet).sort((a, b) => a - b)
  }

  function getTopicsForUnit(grade, semester, unit) {
    const topicSet = new Set()
    words.value
      .filter(w => w.grade === grade && w.semester === semester && w.unit === unit)
      .forEach(w => topicSet.add(w.topic))
    return Array.from(topicSet)
  }

  function getRandomWords(count, excludeIds = []) {
    const available = words.value.filter(w => !excludeIds.includes(w.id))
    const shuffled = [...available].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, Math.min(count, shuffled.length))
  }

  return {
    words,
    topics,
    loaded,
    loading,
    loadVocabulary,
    getWordsByGradeSemester,
    getWordsByUnit,
    getWordById,
    getUnitsForGradeSemester,
    getTopicsForUnit,
    getRandomWords
  }
})
