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
      path: '/manajemen-akun',
      name: 'manajemen-akun',
      component: ManajemenAkunView,
      meta: { requiresAuth: true, requiredRole: 'ADMIN' },
    },
    {
      path: '/profile',
      name: 'profile',
      component: ProfileView,
      meta: { requiresAuth: true },
    },
    {
    path: '/katalog-lomba',
    name: 'katalog-lomba',
    component: () => import('@/views/KatalogLombaView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/buat-lomba',
    name: 'BuatLomba',
    component: () => import('@/views/lomba/BuatLombaView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/edit-lomba/:id',
    name: 'EditLomba',
    component: () => import('@/views/lomba/EditLombaView.vue'),
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
    // Redirect berdasarkan role
    if (user?.role === 'Admin') {
      return next({ name: 'manajemen-akun' })
    } else {
      return next({ name: 'profile' })
    }
  }

  // Kalau sudah login tapi coba akses login/register
  if (to.meta.requiresGuest && isAuthenticated) {
    if (isFirstLogin) {
      return next({ name: 'change-password' })
    }
    // Jika sudah login dan bukan first login, redirect sesuai role
    if (user?.role === 'ADMIN') {
      return next({ name: 'manajemen-akun' })
    } else {
      return next({ name: 'profile' })
    }
  }

  // Kalau sudah login dan masih firstLogin
  if (isAuthenticated && isFirstLogin && to.name !== 'change-password') {
    return next({ name: 'change-password' })
  }

  // Role-based access control untuk route yang membutuhkan role spesifik
  if (to.meta.requiredRole && isAuthenticated) {
    if (user?.role !== to.meta.requiredRole) {
      // Jika user tidak punya role yang diperlukan, redirect ke profile
      return next({ name: 'profile' })
    }
  }

  next()
})

export default router
