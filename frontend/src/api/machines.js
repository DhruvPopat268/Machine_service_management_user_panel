import axiosInstance from './axiosInstance'

const BASE = `${import.meta.env.VITE_API_URL}/api/customer/owned-machines`

const unwrap = (res) => {
  if (!res.data.success) throw new Error(res.data.message || 'Something went wrong')
  return res.data
}

export const fetchOwnedMachines = (page = 1, limit = 10) =>
  axiosInstance.get(`${BASE}/`, { params: { page, limit } }).then(unwrap).then((d) => ({ ...d.data, pagination: d.pagination }))

export const fetchMachineDetail = (variantId) =>
  axiosInstance.get(`${BASE}/${variantId}`).then(unwrap).then((d) => d.data)
