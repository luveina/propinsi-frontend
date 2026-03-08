import { createRouter, createWebHistory } from 'vue-router'

import LoginView from '@/views/LoginView.vue'
import RegisterView from '@/views/RegisterView.vue'
import ChangePasswordView from '@/views/ChangePasswordView.vue'
import ProfileView from '@/views/ProfileView.vue'
// import HomeView from '@/views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      // component: LoginView,
      component: () => import('@/views/LoginView.vue'),
      meta: { requiresGuest: true },
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/views/RegisterView.vue'),
      meta: { requiresGuest: true },
    },
    {
      path: '/change-password',
      name: 'change-password',
      component: () => import('@/views/ChangePasswordView.vue'),
      meta: { requiresAuth: true, requiresFirstLogin: true },
    },
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/ManajemenAkunView.vue'),
      meta: { requiresAuth: true },
    },
    {
    path: '/profile',
    name: 'profile',
    component: () => import('@/views/ProfileView.vue'), 
    meta: { requiresAuth: true },
  },
  
  ],
})

router.beforeEach((to, _from, next) => {
  const token = localStorage.getItem('token')
  const userRaw = localStorage.getItem('user')
  const user = userRaw ? JSON.parse(userRaw) : null

  const isAuthenticated = !!token
  const isFirstLogin = user?.isFirstLogin ?? false

  // Halaman yang butuh login
  if (to.meta.requiresAuth && !isAuthenticated) {
    return next({ name: 'login' })
  }

  // Halaman yang hanya untuk first login (change-password)
  if (to.meta.requiresFirstLogin && !isFirstLogin) {
    return next({ name: 'home' })
  }

  // Kalau sudah login tapi coba akses login/register, redirect ke home
  if (to.meta.requiresGuest && isAuthenticated) {
    // Tapi kalau masih first login, biarkan akses change-password
    if (isFirstLogin) {
      return next({ name: 'change-password' })
    }
    return next({ name: 'home' })
  }

  // Kalau sudah login tapi masih firstLogin, paksa ke change-password dulu
  if (isAuthenticated && isFirstLogin && to.name !== 'change-password') {
    return next({ name: 'change-password' })
  }

  next()
})

export default router
