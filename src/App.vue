<template>
  <div id="app" class="app-container">
    <AppHeader v-if="showHeader" />
    <main class="main-content" :class="{ 'main-content--bare': !showHeader }">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
    <AppNav v-if="showHeader" />
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from './stores/user'
import { useVocabularyStore } from './stores/vocabulary'
import AppHeader from './components/AppHeader.vue'
import AppNav from './components/AppNav.vue'

const route = useRoute()
const userStore = useUserStore()
const vocabStore = useVocabularyStore()

const showHeader = computed(() => {
  return route.name !== 'UserSelect'
})

onMounted(() => {
  userStore.loadUsers()
  vocabStore.loadVocabulary()
})
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
