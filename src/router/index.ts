import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '@/views/LoginView.vue'
import RegisterView from '@/views/RegisterView.vue'
import ChangePasswordView from '@/views/ChangePasswordView.vue'
import ManajemenAkunView from '@/views/ManajemenAkunView.vue'
import ProfileView from '@/views/ProfileView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { requiresGuest: true },
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView,
      meta: { requiresGuest: true },
    },
    {
      path: '/change-password',
      name: 'change-password',
      component: ChangePasswordView,
      meta: { requiresAuth: true, requiresFirstLogin: true },
    },
    {
      path: '/',
      name: 'home',
      component: ManajemenAkunView,
      meta: { requiresAuth: true },
    },
    {
      path: '/profile',
      name: 'profile',
      component: ProfileView,
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

  // Halaman change-password: hanya untuk first login
  if (to.meta.requiresFirstLogin && !isFirstLogin) {
    return next({ name: 'home' })
  }

  // Kalau sudah login tapi coba akses login/register
  if (to.meta.requiresGuest && isAuthenticated) {
    if (isFirstLogin) {
      return next({ name: 'change-password' })
    }
    return next({ name: 'home' })
  }

  // Kalau sudah login dan masih firstLogin 
  if (isAuthenticated && isFirstLogin && to.name !== 'change-password') {
    return next({ name: 'change-password' })
  }

  next()
})

export default router
