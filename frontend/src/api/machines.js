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

export const fetchAllOwnedMachines = () =>
  axiosInstance.get(`${BASE}/all`).then(unwrap).then((d) => d.data)

export const fetchProblemTypes = () =>
  axiosInstance.get(`${import.meta.env.VITE_API_URL}/api/customer/problem-types`).then(unwrap).then((d) => d.data)

const SC_BASE = `${import.meta.env.VITE_API_URL}/api/customer/service-calls`

export const fetchActiveCalls = () =>
  axiosInstance.get(`${SC_BASE}/active`).then(unwrap).then((d) => d.data)

export const fetchCompletedCalls = () =>
  axiosInstance.get(`${SC_BASE}/completed`).then(unwrap).then((d) => d.data)

export const fetchCancelledCalls = () =>
  axiosInstance.get(`${SC_BASE}/cancelled`).then(unwrap).then((d) => d.data)

export const fetchCallDetail = (id) =>
  axiosInstance.get(`${SC_BASE}/${id}`).then(unwrap).then((d) => d.data)

export const fetchDashboard = () =>
  axiosInstance.get(`${SC_BASE}/dashboard`).then(unwrap).then((d) => d.data)

export const raiseServiceCall = (selected) => {
  const formData = new FormData()
  const serviceCalls = Object.entries(selected).map(([variantId, detail]) => ({
    variantId,
    issueDescription: detail.issueDescription,
    ...(detail.problemTypeId ? { problemTypeId: detail.problemTypeId } : {}),
  }))
  formData.append('serviceCalls', JSON.stringify(serviceCalls))
  Object.entries(selected).forEach(([, detail], idx) => {
    detail.photos.forEach((p) => formData.append(`images_${idx}`, p.file))
  })
  return axiosInstance.post(
    `${import.meta.env.VITE_API_URL}/api/customer/service-calls/raise`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  ).then(unwrap)
}
