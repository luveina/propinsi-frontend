import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '@/views/LoginView.vue'
import RegisterView from '@/views/RegisterView.vue'
import ChangePasswordView from '@/views/ChangePasswordView.vue'
import ManajemenAkunView from '@/views/ManajemenAkunView.vue'
import ProfileView from '@/views/ProfileView.vue'
import PembayaranPage from '@/views/pendaftaran/PembayaranPage.vue'
// import AppLayout from '@/layout/AppLayout.vue'
import MyTicketsView from '@/views/ticket/MyTicketsView.vue'
import TicketDetailView from '@/views/ticket/TicketDetailView.vue'

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
      redirect: { name: 'katalog-lomba' },
    },
    {
      path: '/katalog-lomba',
      name: 'katalog-lomba',
      component: () => import('@/views/KatalogLombaView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/katalog-lomba/:id',
      name: 'detail-lomba',
      component: () => import('@/views/lomba/DetailLombaView.vue'),
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
      path: '/penjurian',
      name: 'penjurian',
      component: () => import('@/views/ScoringView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/penjurian',
      name: 'penjurian',
      component: () => import('@/views/ScoringView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/penjurian/hasil/:lombaId',
      name: 'hasil-ajuan',
      component: () => import('@/views/HasilAjuanView.vue'),
      meta: { requiresAuth: true, requiredRole: 'JURI' },
    },
    {
      path: '/penjurian/koncer/:lombaId',
      name: 'babak-koncer',
      component: () => import('@/views/lomba/BabakKoncerView.vue'),
      meta: { requiresAuth: true, requiredRole: 'JURI' },
    },
    {
      path: '/hasil-akhir',
      name: 'hasil-akhir',
      component: () => import('@/views/lomba/HasilAkhirView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/winner/:lombaId',
      name: 'winner',
      component: () => import('@/views/lomba/HasilAkhirView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/reservasi/:lombaId',
      name: 'reservasi-gantangan',
      component: () => import('@/views/pendaftaran/ReservasiGantanganView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/katalog-lomba/:id',
      name: 'detail-lomba',
      component: () => import('@/views/lomba/DetailLombaView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/reservasi/:lombaId',
      name: 'reservasi-gantangan',
      component: () => import('@/views/pendaftaran/ReservasiGantanganView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/pembayaran',
      name: 'pembayaran',
      component: PembayaranPage,
      // Kita pancing parameter dari URL query
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('@/views/dashboard/DashboardView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/verifikasi-pembayaran',
      name: 'verifikasi-pembayaran',
      component: () => import('@/views/pendaftaran/VerifikasiPembayaranView.vue'),
      meta: { requiresAuth: true, requiredRole: 'KOORDINATOR_PENDAFTARAN' },
    },
    {
      path: '/check-in/:eventId',
      name: 'check-in',
      component: () => import('@/views/pendaftaran/CheckInView.vue'),
      meta: { requiresAuth: true, requiredRole: 'KOORDINATOR_PENDAFTARAN' },
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

    // ─── PBI-20: Tiket Saya ───────────────────────────────────────────
    {
      path: '/tiket-saya',
      name: 'MyTickets',
      component: MyTicketsView,
      meta: { requiresAuth: true, requiredRole: 'PESERTA' },
    },
    {
      path: '/tiket-saya/:id',
      name: 'TicketDetail',
      component: TicketDetailView,
      meta: { requiresAuth: true, requiredRole: 'PESERTA' },
      props: true,
    },
    {
      path: '/upload-bukti/:id',
      name: 'UploadBukti',
      component: PembayaranPage,
      meta: { requiresAuth: true, requiredRole: 'PESERTA' },
      props: true,
    },
    // ─── Fallback ─────────────────────────────────────────────────────
    {
      path: '/:pathMatch(.*)*',
      redirect: { name: 'katalog-lomba' },
    },
  ],
})

// export default router

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
