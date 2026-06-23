<template>
  <div class="user-select-view">
    <!-- 返回 -->
    <button class="back-btn" @click="goBack" title="返回" aria-label="返回">
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
    </button>

    <!-- ============ LAUNCH HERO ============ -->
    <header class="select-hero hero animate-slide-up">
      <span class="spark spark--1">✨</span>
      <span class="spark spark--2">⭐</span>
      <span class="spark spark--3">🌟</span>
      <span class="spark spark--4">✨</span>
      <div class="hero-inner hero-inner--center">
        <div class="hero-emoji hero-emoji--xl">🧑‍🎓</div>
        <h1 class="hero-title">选择你的角色</h1>
        <p class="hero-sub">开启属于你的单词魔法冒险 ✨</p>
      </div>
    </header>

    <!-- 已有用户列表 -->
    <div class="user-list" v-if="userStore.allUsers.length">
      <div
        class="user-card card-clickable animate-slide-up"
        v-for="(user, index) in userStore.allUsers"
        :key="user.id"
        :style="{ '--accent': avatarAccent(index), animationDelay: `${0.1 + index * 0.07}s` }"
        @click="selectUser(user)"
      >
        <div class="user-card-avatar">{{ user.avatar }}</div>
        <div class="user-card-info">
          <div class="user-card-name">{{ user.name }}</div>
          <div class="user-card-stats">已学 {{ user.learnedWords?.length || 0 }} 词 · {{ user.stats?.totalPoints || 0 }} ⭐</div>
        </div>
        <button class="delete-btn" @click.stop="confirmDelete(user)" title="删除">🗑️</button>
      </div>
    </div>

    <!-- 创建新用户 -->
    <div class="create-section">
      <button class="create-btn" @click="showCreateForm = !showCreateForm">
        <span>➕</span> 创建新角色
      </button>

      <div class="create-form card" v-if="showCreateForm">
        <div class="form-group">
          <label>名字</label>
          <input
            v-model="newUserName"
            type="text"
            placeholder="输入你的名字"
            maxlength="10"
            class="form-input"
          />
        </div>
        <div class="form-group">
          <label>选择头像</label>
          <div class="avatar-grid">
            <button
              class="avatar-option"
              :class="{ selected: newAvatar === avatar }"
              v-for="avatar in avatarOptions"
              :key="avatar"
              @click="newAvatar = avatar"
            >
              {{ avatar }}
            </button>
          </div>
        </div>
        <button
          class="btn btn-primary btn-block"
          @click="createUser"
          :disabled="!newUserName.trim()"
        >
          创建角色 🚀
        </button>
      </div>
    </div>

    <!-- 删除确认弹窗 -->
    <div class="modal-overlay" v-if="showDeleteConfirm" @click="showDeleteConfirm = false">
      <div class="modal-content card" @click.stop>
        <div class="modal-emoji">⚠️</div>
        <h3>确认删除？</h3>
        <p>删除 {{ deleteTarget?.name }} 的学习记录？此操作不可恢复。</p>
        <div class="modal-actions">
          <button class="btn btn-ghost" @click="showDeleteConfirm = false">取消</button>
          <button class="btn btn-danger" @click="deleteUser">删除</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '../stores/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const showCreateForm = ref(false)
const newUserName = ref('')
const newAvatar = ref('🧒')
const showDeleteConfirm = ref(false)
const deleteTarget = ref(null)

const avatarOptions = ['🧒', '👧', '👦', '🧑', '👩', '🐱', '🐶', '🐰', '🦊', '🐼', '🦁', '🐸']

// 给每个角色卡分配一种强调色，增加识别度
const accentPool = ['#7C5CFC', '#2DD4BF', '#60A5FA', '#FBBF24', '#FB7185']
function avatarAccent(i) {
  return accentPool[i % accentPool.length]
}

// 返回：有历史则后退，否则回首页
function goBack() {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/')
  }
}

function selectUser(user) {
  userStore.selectUser(user.id)
  const redirect = route.query.redirect || '/'
  router.push(redirect)
}

function createUser() {
  if (!newUserName.value.trim()) return
  const user = userStore.createUser(newUserName.value.trim(), newAvatar.value)
  userStore.selectUser(user.id)
  const redirect = route.query.redirect || '/'
  router.push(redirect)
}

function confirmDelete(user) {
  deleteTarget.value = user
  showDeleteConfirm.value = true
}

function deleteUser() {
  if (deleteTarget.value) {
    userStore.deleteUser(deleteTarget.value.id)
  }
  showDeleteConfirm.value = false
  deleteTarget.value = null
}
</script>

<style scoped>
.user-select-view {
  max-width: 560px;
  margin: 0 auto;
  padding: 28px 16px 40px;
}

/* 返回按钮：固定左上角 */
.back-btn {
  position: fixed;
  top: 16px;
  left: 16px;
  width: 44px;
  height: 44px;
  border: none;
  border-radius: 50%;
  background: var(--bg-card);
  color: var(--primary);
  cursor: pointer;
  display: grid;
  place-items: center;
  box-shadow: var(--shadow-md);
  z-index: 50;
  transition: var(--transition);
}
.back-btn:hover {
  background: var(--primary);
  color: #fff;
  transform: scale(1.06);
}
.back-btn:active { transform: scale(0.96); }

/* ============================================
   LAUNCH HERO
   ============================================ */
.hero {
  position: relative;
  border-radius: var(--radius-2xl);
  padding: 40px 24px;
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
    radial-gradient(1px 1px at 58% 38%, rgba(255, 255, 255, 0.5), transparent 60%),
    radial-gradient(1.4px 1.4px at 30% 88%, rgba(255, 255, 255, 0.6), transparent 60%);
  animation: twinkle 4.5s ease-in-out infinite alternate;
  z-index: -1;
}
.hero::after {
  content: '';
  position: absolute;
  right: -70px; top: -70px;
  width: 240px; height: 240px;
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
.spark--1 { top: 14%; left: 8%; }
.spark--2 { top: 70%; left: 12%; font-size: 14px; animation-delay: 1.4s; }
.spark--3 { top: 22%; right: 12%; font-size: 16px; animation-delay: 0.7s; }
.spark--4 { top: 72%; right: 10%; animation-delay: 2.1s; }

.hero-inner { position: relative; z-index: 1; }
.hero-inner--center { text-align: center; }
.hero-emoji { font-size: 46px; display: inline-block; animation: float 3s ease-in-out infinite; }
.hero-emoji--xl { font-size: 68px; margin-bottom: 8px; }
.hero-title {
  font-family: var(--font-display);
  font-size: clamp(26px, 5.5vw, 36px);
  font-weight: 700;
  letter-spacing: -0.02em;
  text-shadow: 0 2px 12px rgba(0, 0, 0, 0.18);
}
.hero-sub { margin-top: 6px; font-size: clamp(13px, 2.4vw, 15px); color: var(--text-on-dark-muted); }

@keyframes twinkle { 0% { opacity: 0.55; } 100% { opacity: 1; } }
@keyframes floatSpark { 0%, 100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-9px) rotate(12deg); } }
@keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }

/* ============================================
   USER CARDS
   ============================================ */
.user-list { display: flex; flex-direction: column; gap: 12px; margin-bottom: 20px; }
.user-card {
  --accent: var(--primary);
  position: relative;
  display: flex;
  align-items: center;
  gap: 16px;
  background: var(--bg-card);
  border-radius: var(--radius-xl);
  padding: 18px 20px;
  box-shadow: var(--shadow-card);
  border: 1.5px solid rgba(45, 27, 105, 0.05);
  transition: var(--transition);
  overflow: hidden;
}
.user-card::before {
  content: '';
  position: absolute;
  left: 0; top: 0; bottom: 0;
  width: 5px;
  background: var(--accent);
  opacity: 0.85;
}
.user-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-lg);
  border-color: color-mix(in srgb, var(--accent) 35%, transparent);
}

.user-card-avatar {
  font-size: 40px;
  width: 60px; height: 60px;
  flex-shrink: 0;
  display: grid; place-items: center;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--accent), color-mix(in srgb, var(--accent) 58%, #fff));
  box-shadow: 0 6px 14px color-mix(in srgb, var(--accent) 32%, transparent);
}
.user-card-info { flex: 1; min-width: 0; }
.user-card-name {
  font-family: var(--font-display);
  font-size: 19px;
  font-weight: 600;
  color: var(--text-primary);
  letter-spacing: -0.01em;
}
.user-card-stats { font-size: 13px; color: var(--text-secondary); margin-top: 2px; }

.delete-btn {
  width: 36px; height: 36px;
  border: none;
  background: transparent;
  border-radius: 50%;
  cursor: pointer;
  font-size: 16px;
  transition: var(--transition);
  opacity: 0.4;
}
.delete-btn:hover { opacity: 1; background: var(--coral-light); }

/* ============================================
   CREATE
   ============================================ */
.create-section { margin-top: 8px; }
.create-btn {
  width: 100%;
  padding: 16px;
  border: 2px dashed var(--primary-light);
  background: var(--primary-ghost);
  border-radius: var(--radius-lg);
  font-size: 16px;
  font-weight: 600;
  color: var(--primary);
  cursor: pointer;
  transition: var(--transition);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-family: var(--font-body);
}
.create-btn:hover { background: rgba(124, 92, 252, 0.12); border-color: var(--primary); }

.create-form { margin-top: 14px; animation: slide-up 0.3s var(--ease); }
.form-group { margin-bottom: 16px; }
.form-group label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
}
.form-input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid rgba(124, 92, 252, 0.2);
  border-radius: var(--radius-md);
  font-size: 16px;
  font-family: var(--font-body);
  transition: var(--transition);
  outline: none;
  background: var(--bg-page);
}
.form-input:focus {
  border-color: var(--primary);
  background: var(--bg-card);
  box-shadow: 0 0 0 3px rgba(124, 92, 252, 0.12);
}

.avatar-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 8px; }
.avatar-option {
  width: 100%;
  aspect-ratio: 1;
  border: 2px solid transparent;
  background: var(--primary-ghost);
  border-radius: var(--radius-md);
  font-size: 28px;
  cursor: pointer;
  transition: var(--transition);
}
.avatar-option:hover { background: rgba(124, 92, 252, 0.14); transform: scale(1.05); }
.avatar-option.selected {
  border-color: var(--primary);
  background: rgba(124, 92, 252, 0.18);
  transform: scale(1.05);
}

/* ============================================
   MODAL
   ============================================ */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(45, 27, 105, 0.45);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  animation: fade 0.2s ease;
}
@keyframes fade { from { opacity: 0; } to { opacity: 1; } }

.modal-content {
  max-width: 340px;
  width: 100%;
  text-align: center;
  animation: bounce-in 0.4s var(--ease);
}
.modal-emoji { font-size: 40px; margin-bottom: 8px; }
.modal-content h3 { font-family: var(--font-display); font-size: 22px; font-weight: 700; margin-bottom: 8px; color: var(--text-primary); }
.modal-content p { color: var(--text-secondary); margin-bottom: 20px; font-size: 14px; }
.modal-actions { display: flex; gap: 12px; }
.modal-actions .btn { flex: 1; }

/* ============================================
   RESPONSIVE
   ============================================ */
@media (min-width: 768px) {
  .user-select-view { max-width: none; padding: 40px 24px; }
  .hero { padding: 52px 32px; }
  .hero-emoji--xl { font-size: 84px; }
  .hero-title { font-size: 40px; }

  .user-list { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
  .user-card { padding: 20px 22px; }
  .user-card-avatar { font-size: 46px; width: 68px; height: 68px; }
  .user-card-name { font-size: 20px; }

  .create-btn { font-size: 17px; padding: 20px; }
  .avatar-grid { gap: 10px; }
  .avatar-option { font-size: 32px; }
  .modal-content { max-width: 420px; padding: 30px; }
}

@media (min-width: 1024px) {
  .user-select-view { max-width: 760px; padding: 56px 32px; }
  .hero { padding: 60px 40px; }
  .hero-emoji--xl { font-size: 96px; }
  .hero-title { font-size: 44px; }
  .user-card { padding: 24px 26px; }
  .user-card-avatar { font-size: 52px; width: 76px; height: 76px; }
  .user-card-name { font-size: 22px; }
  .avatar-option { font-size: 36px; }
  .modal-content { max-width: 460px; padding: 32px; }
}

@media (min-width: 1440px) {
  .user-select-view { max-width: 900px; }
  .user-list { grid-template-columns: repeat(3, 1fr); }
}
</style>
