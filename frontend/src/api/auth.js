import axios from 'axios'
import axiosInstance from './axiosInstance'

const BASE = `${import.meta.env.VITE_API_URL}/api/customer/auth`

const publicAxios = axios.create({
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})

const unwrap = (res) => {
  if (!res.data.success) throw new Error(res.data.message || 'Something went wrong')
  return res.data
}

const unwrapPublic = async (promise) => {
  try {
    return unwrap(await promise)
  } catch (err) {
    const message = err.response?.data?.message || err.message || 'Something went wrong'
    throw new Error(message)
  }
}

// Public routes — plain axios, no interceptor
export const fetchZones = () =>
  unwrapPublic(publicAxios.get(`${BASE}/zones`)).then((d) => d.data)

export const signup = (body) =>
  unwrapPublic(publicAxios.post(`${BASE}/signup`, body))

export const login = (body) =>
  unwrapPublic(publicAxios.post(`${BASE}/login`, body))

export const sendResetOtp = (email) =>
  unwrapPublic(publicAxios.post(`${BASE}/send-reset-otp`, { email }))

export const verifyOtpResetPassword = (body) =>
  unwrapPublic(publicAxios.post(`${BASE}/verify-otp-reset-password`, body))

// Authenticated routes — axiosInstance with 401 interceptor
export const fetchProfile = () =>
  axiosInstance.get(`${BASE}/profile`).then(unwrap).then((d) => d.data)

export const logout = () =>
  axiosInstance.post(`${BASE}/logout`).then(unwrap)

export const updateProfile = (body) =>
  axiosInstance.patch(`${BASE}/update-profile`, body).then(unwrap)

export const sendChangeEmailOtp = (newEmail) =>
  axiosInstance.post(`${BASE}/send-change-email-otp`, { newEmail }).then(unwrap)

export const verifyOtpChangeEmail = (otp) =>
  axiosInstance.post(`${BASE}/verify-otp-change-email`, { otp }).then(unwrap)

export const changePassword = (body) =>
  axiosInstance.post(`${BASE}/change-password`, body).then(unwrap)
