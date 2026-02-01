import AboutView from '@/pages/AboutView.vue'
import Dashboard from '@/pages/DashboardView.vue'
import HowToUseView from '@/pages/HowToUseView.vue'
import Main from '@/pages/MainView.vue'
import PrivacyView from '@/pages/PrivacyView.vue'
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'Main', component: Main },
    { path: '/dashboard', name: 'Dashboard', component: Dashboard, props: true },
    { path: '/privacy', name: 'Privacidade', component: PrivacyView },
    { path: '/about', name: 'Sobre', component: AboutView },
    { path: '/how-to-use', name: 'HowToUse', component: HowToUseView }
  ],
})

export default router
