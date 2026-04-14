import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '@/views/LoginView.vue'
import RegisterView from '@/views/RegisterView.vue'
import ChangePasswordView from '@/views/ChangePasswordView.vue'
import ManajemenAkunView from '@/views/ManajemenAkunView.vue'
import ProfileView from '@/views/ProfileView.vue'

import AppLayout from '@/layout/AppLayout.vue'
import MyTicketsView from '@/views/ticket/MyTicketsView.vue'
import TicketDetailView from '@/views/ticket/TicketDetailView.vue'
import UploadBuktiView from '@/views/Uploadbuktiview.vue'


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // ─── Tanpa layout (guest) ─────────────────────────────────────────
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

    // ─── Dengan AppLayout (Sidebar desktop + HeaderMobile) ────────────
    {
      path: '/',
      component: AppLayout,
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          redirect: { name: 'katalog-lomba' },
        },
        {
          path: 'manajemen-akun',
          name: 'manajemen-akun',
          component: ManajemenAkunView,
          meta: { requiresAuth: true, requiredRole: 'ADMIN', title: 'Manajemen Akun' },
        },
        {
          path: 'profile',
          name: 'profile',
          component: ProfileView,
          meta: { requiresAuth: true, title: 'Profil Saya' },
        },
        {
          path: 'katalog-lomba',
          name: 'katalog-lomba',
          component: () => import('@/views/KatalogLombaView.vue'),
          meta: { requiresAuth: true, title: 'Katalog Lomba' },
        },
        // {
        //   path: 'katalog-lomba/:id',
        //   name: 'detail-lomba',
        //   component: () => import('@/views/lomba/DetailLombaView.vue'),
        //   meta: { requiresAuth: true, title: 'Detail Lomba' },
        // },
        {
          path: 'buat-lomba',
          name: 'BuatLomba',
          component: () => import('@/views/lomba/BuatLombaView.vue'),
          meta: { requiresAuth: true, title: 'Buat Lomba' },
        },
        {
          path: 'edit-lomba/:id',
          name: 'EditLomba',
          component: () => import('@/views/lomba/EditLombaView.vue'),
          meta: { requiresAuth: true, title: 'Edit Lomba' },
        },
        // {
        //   path: 'penjurian',
        //   name: 'penjurian',
        //   component: () => import('@/views/ScoringView.vue'),
        //   meta: { requiresAuth: true, title: 'Penjurian' },
        // },
        // {
        //   path: 'reservasi/:lombaId',
        //   name: 'reservasi-gantangan',
        //   component: () => import('@/views/pendaftaran/ReservasiGantanganView.vue'),
        //   meta: { requiresAuth: true, title: 'Reservasi Gantangan' },
        // },
        {
          path: 'verifikasi-pembayaran',
          name: 'verifikasi-pembayaran',
          component: () => import('@/views/pendaftaran/VerifikasiPembayaranView.vue'),
          meta: { requiresAuth: true, requiredRole: 'KOORDINATOR_PENDAFTARAN', title: 'Verifikasi Pembayaran' },
        },
        {
          path: 'tiket-saya',
          name: 'MyTickets',
          component: () => MyTicketsView,
          // meta: { requiresAuth: true, requiredRole: 'PESERTA', title: 'Tiket Saya' },
          meta: { requiresGuest: true, title: 'Tiket Saya' },
        },
        {
          path: 'tiket-saya/:id',
          name: 'TicketDetail',
          component: () => TicketDetailView,
          meta: { requiresAuth: true, requiredRole: 'PESERTA', title: 'Detail E-Ticket' },
          props: true,
        },
        {
          path: 'upload-bukti/:id',
          name: 'UploadBukti',
          component: () => UploadBuktiView,
          meta: { requiresAuth: true, requiredRole: 'PESERTA', title: 'Upload Bukti Pembayaran' },
          props: true,
        },
      ],
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
  {
    path: '/',
    redirect: { name: 'katalog-lomba' },
  },
  {
    path: '/reservasi/:lombaId',
    name: 'reservasi-gantangan',
    component: () => import('@/views/pendaftaran/ReservasiGantanganView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/katalog-lomba/:id', 
    name: 'detail-lomba',
    component: () => import('@/views/lomba/DetailLombaView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: { name: 'katalog-lomba' },
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
    if (user?.role === 'ADMIN') {
      return next({ name: 'manajemen-akun' })
    } else {
      return next({ name: 'katalog-lomba' })
    }
  }

  // Kalau sudah login tapi coba akses login/register
  if (to.meta.requiresGuest && isAuthenticated) {
    if (isFirstLogin) {
      return next({ name: 'change-password' })
    }
    return next({ name: 'katalog-lomba' })
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
