<template>
  <nav class="app-nav">
    <div class="sidebar-logo">
      <span class="sidebar-logo-icon">📚</span>
      <span class="sidebar-logo-text">英语小达人</span>
    </div>
    <router-link to="/" class="nav-item" :class="{ active: $route.path === '/' }">
      <span class="nav-icon">🏠</span>
      <span class="nav-label">首页</span>
    </router-link>
    <router-link to="/learn" class="nav-item" :class="{ active: $route.path.startsWith('/learn') }">
      <span class="nav-icon">📖</span>
      <span class="nav-label">学习</span>
    </router-link>
    <router-link to="/quiz" class="nav-item" :class="{ active: $route.path === '/quiz' }">
      <span class="nav-icon">🎮</span>
      <span class="nav-label">闯关</span>
    </router-link>
    <router-link to="/review" class="nav-item" :class="{ active: $route.path === '/review' }">
      <span class="nav-icon">🔄</span>
      <span class="nav-label">复习</span>
    </router-link>
    <router-link to="/progress" class="nav-item" :class="{ active: $route.path === '/progress' }">
      <span class="nav-icon">📊</span>
      <span class="nav-label">我的</span>
    </router-link>
    <!-- 桌面端侧边栏底部装饰 -->
    <div class="sidebar-footer">
      <span class="sidebar-version">v1.0 · 英语小达人</span>
    </div>
  </nav>
</template>

<style scoped>
/* === Mobile: 底部导航 === */
.app-nav {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: var(--content-max);
  display: flex;
  background: var(--bg-card);
  border-top: 1.5px solid rgba(124, 92, 252, 0.08);
  padding: 6px 0;
  padding-bottom: max(6px, env(safe-area-inset-bottom));
  z-index: 200;
  box-shadow: 0 -2px 12px rgba(45, 27, 105, 0.06);
}

.sidebar-footer { display: none; }
.sidebar-logo { display: none; }

.nav-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 6px 0;
  text-decoration: none;
  color: var(--text-light);
  transition: var(--transition);
}

.nav-item:hover { color: var(--primary-light); }
.nav-item.active { color: var(--primary); }
.nav-item.active .nav-icon { transform: scale(1.15); }
.nav-icon { font-size: 22px; transition: transform 0.2s var(--ease); }
.nav-label { font-size: 11px; font-weight: 600; }

/* === Tablet === */
@media (min-width: 768px) {
  .app-nav { padding: 10px 0; }
  .nav-item { padding: 8px 0; gap: 4px; }
  .nav-icon { font-size: 26px; }
  .nav-label { font-size: 13px; }
}

/* === Desktop: 左侧边栏（全屏宽度） === */
@media (min-width: 1024px) {
  .app-nav {
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
    transform: none;
    width: var(--sidebar-width);
    max-width: var(--sidebar-width);
    flex-direction: column;
    background: var(--deep);
    border: none;
    border-radius: 0;
    padding: 0;
    box-shadow: 4px 0 24px rgba(45, 27, 105, 0.12);
    overflow-y: auto;
  }

  /* 侧边栏 Logo 区域 */
  .sidebar-logo {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 26px 20px 18px;
    margin: 0 12px 8px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  }

  .sidebar-logo-icon {
    font-size: 24px;
    line-height: 1;
    filter: drop-shadow(0 2px 6px rgba(124, 92, 252, 0.5));
  }

  .sidebar-logo-text {
    font-family: var(--font-display);
    font-size: 17px;
    font-weight: 700;
    color: var(--text-on-dark);
    letter-spacing: -0.01em;
    white-space: nowrap;
  }

  .nav-item {
    flex: none;
    flex-direction: row;
    gap: 12px;
    padding: 12px 16px;
    margin: 2px 12px;
    border-radius: var(--radius-md);
    color: var(--text-on-dark-muted);
    justify-content: flex-start;
    font-size: 15px;
  }

  .nav-item:hover {
    background: rgba(255, 255, 255, 0.06);
    color: var(--text-on-dark);
  }

  .nav-item.active {
    background: rgba(124, 92, 252, 0.3);
    color: white;
    font-weight: 600;
  }

  .nav-item.active .nav-icon {
    transform: scale(1.05);
  }

  .nav-icon { font-size: 20px; }
  .nav-label { font-size: 15px; font-weight: 500; }

  /* 侧边栏底部版本信息 */
  .sidebar-footer {
    display: block;
    margin-top: auto;
    padding: 16px 20px;
    border-top: 1px solid rgba(255, 255, 255, 0.06);
  }

  .sidebar-version {
    font-size: 11px;
    color: var(--text-on-dark-muted);
    letter-spacing: 0.02em;
  }
}

/* 超宽屏侧边栏加宽 */
@media (min-width: 1920px) {
  .app-nav {
    width: 280px;
    max-width: 280px;
  }
  .nav-item { padding: 14px 20px; }
  .nav-icon { font-size: 22px; }
  .nav-label { font-size: 16px; }
}
</style>
