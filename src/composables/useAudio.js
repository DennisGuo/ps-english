/**
 * 音频播放 composable
 * 使用 audio_manifest.json 索引查找音频文件路径
 * 确保与 Python TTS 生成时完全一致
 */

import { ref } from 'vue'

// 全局 manifest 缓存
let manifestCache = null
let manifestMap = {} // wordId -> { wordAudio, sentenceAudio }

async function loadManifest() {
  if (manifestCache) return manifestCache
  try {
    const res = await fetch('/data/audio/audio_manifest.json')
    const data = await res.json()
    manifestCache = data
    for (const entry of data.entries) {
      manifestMap[entry.wordId] = {
        wordAudio: entry.wordAudio,
        sentenceAudio: entry.sentenceAudio
      }
    }
    return data
  } catch (e) {
    console.warn('音频 manifest 加载失败:', e)
    return null
  }
}

export function useAudio() {
  const isPlaying = ref(false)
  let currentAudio = null

  /**
   * 播放单词音频（按 wordId 或 单词文本）
   */
  async function playWord(wordOrId) {
    await loadManifest()

    // 如果是数字 id，从 manifest 查找
    if (typeof wordOrId === 'number' && manifestMap[wordOrId]) {
      return playAudio(`/data/audio/${manifestMap[wordOrId].wordAudio}`)
    }

    // 否则按文件名规则生成
    const word = typeof wordOrId === 'string' ? wordOrId : wordOrId.english
    if (!word) return false
    const clean = word.toLowerCase().trim().replace(/ /g, '_').replace(/'/g, '')
    const filename = `word_${clean.split('(')[0].trim()}.mp3`
    return playAudio(`/data/audio/words/${filename}`)
  }

  /**
   * 播放例句音频（按 wordId 或 直接传句子文本）
   */
  async function playSentence(wordOrId) {
    await loadManifest()

    // 如果是数字 id，从 manifest 查找
    if (typeof wordOrId === 'number' && manifestMap[wordOrId]) {
      return playAudio(`/data/audio/${manifestMap[wordOrId].sentenceAudio}`)
    }

    // 否则使用 MD5 哈希（需要与 Python hashlib.md5 一致）
    const sentence = typeof wordOrId === 'string' ? wordOrId : wordOrId.example
    if (!sentence) return false
    const hash = md5(sentence)
    const shortHash = hash.substring(0, 8)
    return playAudio(`/data/audio/sentences/sent_${shortHash}.mp3`)
  }

  /**
   * 播放指定路径的音频
   */
  function playAudio(src) {
    return new Promise((resolve) => {
      stop()
      currentAudio = new Audio(src)
      isPlaying.value = true

      currentAudio.onended = () => {
        isPlaying.value = false
        currentAudio = null
        resolve(true)
      }

      currentAudio.onerror = () => {
        isPlaying.value = false
        currentAudio = null
        resolve(false)
      }

      currentAudio.play().catch(() => {
        isPlaying.value = false
        currentAudio = null
        resolve(false)
      })
    })
  }

  /**
   * 停止当前播放
   */
  function stop() {
    if (currentAudio) {
      currentAudio.pause()
      currentAudio.currentTime = 0
      currentAudio = null
      isPlaying.value = false
    }
  }

  return {
    isPlaying,
    playWord,
    playSentence,
    playAudio,
    stop,
    loadManifest
  }
}

/**
 * 纯 JavaScript MD5 实现
 * 与 Python hashlib.md5 输出完全一致
 * 基于 Joseph Myers 的实现 (http://www.myersdaily.org/joseph/javascript/md5-text.html)
 */
function md5(cycle) {
  function h(a, b) {
    var c, d, e, f, g
    e = a & 2147483648
    f = b & 2147483648
    c = a & 1073741824
    d = b & 1073741824
    g = (a & 1073741823) + (b & 1073741823)
    return c & d ? g ^ 2147483648 ^ e ^ f : c | d ? g & 1073741824 ? g ^ 3221225472 ^ e ^ f : g ^ 1073741824 ^ e ^ f : g ^ e ^ f
  }
  function k(a, b, c, d, e, f, g) { a = h(a, h(h(b & c | ~b & d, e), g)); return h(a << f | a >>> 32 - f, b) }
  function l(a, b, c, d, e, f, g) { a = h(a, h(h(b & d | c & ~d, e), g)); return h(a << f | a >>> 32 - f, b) }
  function m(a, b, c, d, e, f, g) { a = h(a, h(h(b ^ c ^ d, e), g)); return h(a << f | a >>> 32 - f, b) }
  function n(a, b, c, d, e, f, g) { a = h(a, h(h(c ^ (b | ~d), e), g)); return h(a << f | a >>> 32 - f, b) }
  function p(a) {
    var b = '', c, d
    for (d = 0; 3 >= d; d++) c = a >>> 8 * d & 255, b += '0123456789abcdef'.charAt(c >>> 4 & 15) + '0123456789abcdef'.charAt(c & 15)
    return b
  }
  var q = cycle
  // Convert string to UTF-8 encoded bytes
  const encoder = new TextEncoder()
  const bytes = encoder.encode(q)
  const len = bytes.length

  var a = []
  for (var i = 0; i < len; i++) {
    a[i >> 2] = (a[i >> 2] || 0) | (bytes[i] << ((i % 4) * 8))
  }
  a[len >> 2] = (a[len >> 2] || 0) | (128 << ((len % 4) * 8))
  a[(((len + 8) >> 6) + 1) * 16 - 2] = len * 8

  var b = 1732584193, c = 4023233417, d = 2562383102, e = 271733878, f, g, o, r

  for (i = 0; i < a.length; i += 16) {
    f = b; g = c; o = d; r = e
    b = k(b, c, d, e, a[i + 0] || 0, 7, 3614090360)
    e = k(e, b, c, d, a[i + 1] || 0, 12, 3905402710)
    d = k(d, e, b, c, a[i + 2] || 0, 17, 606105819)
    c = k(c, d, e, b, a[i + 3] || 0, 22, 3250441966)
    b = k(b, c, d, e, a[i + 4] || 0, 7, 4118548399)
    e = k(e, b, c, d, a[i + 5] || 0, 12, 1200080426)
    d = k(d, e, b, c, a[i + 6] || 0, 17, 2821735955)
    c = k(c, d, e, b, a[i + 7] || 0, 22, 4249261313)
    b = k(b, c, d, e, a[i + 8] || 0, 7, 1770035416)
    e = k(e, b, c, d, a[i + 9] || 0, 12, 2336552879)
    d = k(d, e, b, c, a[i + 10] || 0, 17, 4294925233)
    c = k(c, d, e, b, a[i + 11] || 0, 22, 2304563134)
    b = k(b, c, d, e, a[i + 12] || 0, 7, 1804603682)
    e = k(e, b, c, d, a[i + 13] || 0, 12, 4254626195)
    d = k(d, e, b, c, a[i + 14] || 0, 17, 2792965006)
    c = k(c, d, e, b, a[i + 15] || 0, 22, 1236535329)
    b = l(b, c, d, e, a[i + 1] || 0, 5, 4129170786)
    e = l(e, b, c, d, a[i + 6] || 0, 9, 3225465664)
    d = l(d, e, b, c, a[i + 11] || 0, 14, 643717713)
    c = l(c, d, e, b, a[i + 0] || 0, 20, 3921069994)
    b = l(b, c, d, e, a[i + 5] || 0, 5, 3593408605)
    e = l(e, b, c, d, a[i + 10] || 0, 9, 38016083)
    d = l(d, e, b, c, a[i + 15] || 0, 14, 3634488961)
    c = l(c, d, e, b, a[i + 4] || 0, 20, 3889429448)
    b = l(b, c, d, e, a[i + 9] || 0, 5, 568446438)
    e = l(e, b, c, d, a[i + 14] || 0, 9, 3275163606)
    d = l(d, e, b, c, a[i + 3] || 0, 14, 4107603335)
    c = l(c, d, e, b, a[i + 8] || 0, 20, 1163531501)
    b = l(b, c, d, e, a[i + 13] || 0, 5, 2850285829)
    e = l(e, b, c, d, a[i + 2] || 0, 9, 4243563512)
    d = l(d, e, b, c, a[i + 7] || 0, 14, 1735328473)
    c = l(c, d, e, b, a[i + 12] || 0, 20, 2368359562)
    b = m(b, c, d, e, a[i + 5] || 0, 4, 4294588738)
    e = m(e, b, c, d, a[i + 8] || 0, 11, 2272392833)
    d = m(d, e, b, c, a[i + 11] || 0, 16, 1839030562)
    c = m(c, d, e, b, a[i + 14] || 0, 23, 4259657740)
    b = m(b, c, d, e, a[i + 1] || 0, 4, 2763975236)
    e = m(e, b, c, d, a[i + 4] || 0, 11, 1272893353)
    d = m(d, e, b, c, a[i + 7] || 0, 16, 4139469664)
    c = m(c, d, e, b, a[i + 10] || 0, 23, 3200236656)
    b = m(b, c, d, e, a[i + 13] || 0, 4, 681279174)
    e = m(e, b, c, d, a[i + 0] || 0, 11, 3936430074)
    d = m(d, e, b, c, a[i + 3] || 0, 16, 3572445317)
    c = m(c, d, e, b, a[i + 6] || 0, 23, 76029189)
    b = m(b, c, d, e, a[i + 9] || 0, 4, 3654602809)
    e = m(e, b, c, d, a[i + 12] || 0, 11, 3873151461)
    d = m(d, e, b, c, a[i + 15] || 0, 16, 530742520)
    c = m(c, d, e, b, a[i + 2] || 0, 23, 3299628645)
    b = n(b, c, d, e, a[i + 0] || 0, 6, 4096336452)
    e = n(e, b, c, d, a[i + 7] || 0, 10, 1126891415)
    d = n(d, e, b, c, a[i + 14] || 0, 15, 2878612391)
    c = n(c, d, e, b, a[i + 5] || 0, 21, 4237533241)
    b = n(b, c, d, e, a[i + 12] || 0, 6, 1700485571)
    e = n(e, b, c, d, a[i + 3] || 0, 10, 2399980690)
    d = n(d, e, b, c, a[i + 10] || 0, 15, 4293915773)
    c = n(c, d, e, b, a[i + 1] || 0, 21, 2240044497)
    b = n(b, c, d, e, a[i + 8] || 0, 6, 1873313359)
    e = n(e, b, c, d, a[i + 15] || 0, 10, 4264355552)
    d = n(d, e, b, c, a[i + 6] || 0, 15, 2734768916)
    c = n(c, d, e, b, a[i + 13] || 0, 21, 1309151649)
    b = n(b, c, d, e, a[i + 4] || 0, 6, 4149444226)
    e = n(e, b, c, d, a[i + 11] || 0, 10, 3174756917)
    d = n(d, e, b, c, a[i + 2] || 0, 15, 718787259)
    c = n(c, d, e, b, a[i + 9] || 0, 21, 3951481745)
    b = h(b, f); c = h(c, g); d = h(d, o); e = h(e, r)
  }
  return (p(b) + p(c) + p(d) + p(e)).toLowerCase()
}
