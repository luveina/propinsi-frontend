/* eslint-disable @typescript-eslint/no-explicit-any */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import type { AuthUser, LoginRequest, RegisterRequest, ChangePasswordRequest } from '@/interfaces/auth.interface'

const BASE_URL = `${import.meta.env.VITE_API_URL}/auth`

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('token')
  return token
    ? { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    : { 'Content-Type': 'application/json' }
}

export const useAuthStore = defineStore('auth', () => {
  const router = useRouter()

  const token = ref<string | null>(localStorage.getItem('token'))
  const user = ref<AuthUser | null>(
    localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null,
  )
  const loading = ref(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => !!token.value)
  const isFirstLogin = computed(() => user.value?.isFirstLogin ?? false)

  async function login(req: LoginRequest) {
    loading.value = true
    error.value = null
    try {
      const res = await fetch(`${BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Login gagal')

      token.value = data.data.token
      user.value = {
        id: data.data.id,
        username: data.data.username,
        role: data.data.role,
        isFirstLogin: data.data.isFirstLogin,
      }
      localStorage.setItem('token', data.data.token)
      localStorage.setItem('user', JSON.stringify(user.value))

      if (data.data.isFirstLogin) {
        router.push('/change-password')
      } else {
        router.push('/')
      }
    } catch (e: any) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  async function register(req: RegisterRequest) {
    loading.value = true
    error.value = null
    try {
      const res = await fetch(`${BASE_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Registrasi gagal')
      return true
    } catch (e: any) {
      error.value = e.message
      return false
    } finally {
      loading.value = false
    }
  }

  async function changeInitialPassword(req: ChangePasswordRequest) {
    loading.value = true
    error.value = null
    try {
      const res = await fetch(`${BASE_URL}/update-initial-password`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(req),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Gagal mengubah password')

      if (user.value) {
        user.value.isFirstLogin = false
        localStorage.setItem('user', JSON.stringify(user.value))
      }
      router.push('/')
      return true
    } catch (e: any) {
      error.value = e.message
      return false
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    try {
      await fetch(`${BASE_URL}/logout`, {
        method: 'POST',
        headers: getAuthHeaders(),
      })
    } catch {
      // tetap lanjut logout meski request gagal
    } finally {
      token.value = null
      user.value = null
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      router.push('/login')
    }
  }

  function clearError() {
    error.value = null
  }

  return {
    token,
    user,
    loading,
    error,
    isAuthenticated,
    isFirstLogin,
    login,
    register,
    changeInitialPassword,
    logout,
    clearError,
  }
})
