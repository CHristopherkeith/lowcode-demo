import { createRouter, createWebHistory } from 'vue-router'
import EditorView from '@/views/editor-view.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'editor',
      component: EditorView,
    },
    {
      path: '/preview',
      name: 'preview',
      component: () => import('@/views/preview-view.vue'),
    },
  ],
})

export default router
