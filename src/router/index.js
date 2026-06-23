import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/HomeView.vue')
  },
  {
    path: '/user',
    name: 'UserSelect',
    component: () => import('../views/UserSelectView.vue')
  },
  {
    path: '/learn',
    name: 'Learn',
    component: () => import('../views/LearnView.vue'),
    meta: { requiresUser: true }
  },
  {
    path: '/learn/:grade/:semester',
    name: 'LearnUnit',
    component: () => import('../views/LearnUnitView.vue'),
    meta: { requiresUser: true }
  },
  {
    path: '/quiz',
    name: 'Quiz',
    component: () => import('../views/QuizView.vue'),
    meta: { requiresUser: true }
  },
  {
    path: '/review',
    name: 'Review',
    component: () => import('../views/ReviewView.vue'),
    meta: { requiresUser: true }
  },
  {
    path: '/progress',
    name: 'Progress',
    component: () => import('../views/ProgressView.vue'),
    meta: { requiresUser: true }
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

// 路由守卫：检查是否需要用户
router.beforeEach((to, from, next) => {
  if (to.meta.requiresUser) {
    const currentUser = localStorage.getItem('currentUser')
    if (!currentUser) {
      next({ name: 'UserSelect', query: { redirect: to.fullPath } })
      return
    }
  }
  next()
})

export default router
