export interface LoginRequest {
  username: string
  password: string
}

export interface RegisterRequest {
  fullName: string
  username: string
  phoneNumber: string
  password: string
  confirmPassword: string
}

export interface ChangePasswordRequest {
  newPassword: string
  confirmPassword: string
}

export interface JwtResponse {
  token: string
  id: number
  username: string
  role: string
  isFirstLogin: boolean
}

export interface BaseResponse<T> {
  status: number
  message: string
  data: T
}

export interface AuthUser {
  id: number
  username: string
  role: string
  isFirstLogin: boolean
}
