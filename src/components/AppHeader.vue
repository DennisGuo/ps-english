<template>
  <header class="app-header">
    <div class="header-left">
      <button v-if="showBack" class="back-btn" @click="goBack" title="返回">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>
      <div class="header-title">
        <span class="title-text">英语小达人</span>
      </div>
    </div>
    <div class="header-right" v-if="userStore.isLoggedIn">
      <div class="user-badge" @click="$router.push('/user')">
        <span class="user-avatar">{{ userStore.currentUser?.avatar }}</span>
        <span class="user-name">{{ userStore.currentUser?.name }}</span>
      </div>
      <div class="points-badge" v-if="userStore.currentUser?.stats?.totalPoints">
        ⭐ {{ userStore.currentUser.stats.totalPoints }}
      </div>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const showBack = computed(() => {
  return route.name !== 'Home' && route.name !== 'UserSelect'
})

function goBack() {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/')
  }
}
</script>

<style scoped>
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: var(--bg-card);
  border-bottom: 1.5px solid rgba(124, 92, 252, 0.06);
  position: sticky;
  top: 0;
  z-index: 100;
  border-radius: 0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.back-btn {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-md);
  border: none;
  background: var(--primary-ghost);
  color: var(--primary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: var(--transition);
}

.back-btn:hover {
  background: var(--primary);
  color: white;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.title-text {
  font-family: var(--font-display);
  font-size: 17px;
  font-weight: 600;
  color: var(--text-primary);
  letter-spacing: -0.01em;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: var(--radius-full);
  background: var(--primary-ghost);
  cursor: pointer;
  transition: var(--transition);
}

.user-badge:hover {
  background: rgba(124, 92, 252, 0.14);
}

.user-avatar { font-size: 20px; }

.user-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
  max-width: 80px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.points-badge {
  padding: 6px 12px;
  border-radius: var(--radius-full);
  background: var(--amber-light);
  font-size: 13px;
  font-weight: 600;
  color: #B45309;
}

/* === Tablet === */
@media (min-width: 768px) {
  .app-header { padding: 14px 24px; }
  .back-btn { width: 40px; height: 40px; }
  .title-text { font-size: 19px; }
  .user-avatar { font-size: 24px; }
  .user-name { max-width: 120px; font-size: 14px; }
  .points-badge { font-size: 14px; padding: 8px 14px; }
  .user-badge { padding: 8px 14px; }
}

/* === Desktop: header 在 sidebar 右侧的内容区内 === */
@media (min-width: 1024px) {
  .app-header {
    padding: 16px 32px;
    background: transparent;
    border-bottom: 1.5px solid rgba(124, 92, 252, 0.06);
  }

  /* 桌面端隐藏 header 中的标题（侧边栏已有 logo） */
  .title-text { font-size: 0; }
  .title-text::after {
    content: '';
  }

  .back-btn {
    width: 42px;
    height: 42px;
    border-radius: var(--radius-md);
  }

  .user-name { max-width: none; font-size: 15px; }
  .user-badge { padding: 8px 16px; gap: 8px; }
  .user-avatar { font-size: 26px; }
  .points-badge { font-size: 15px; padding: 8px 16px; }
}
</style>
