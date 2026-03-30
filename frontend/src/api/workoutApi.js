import api from './axios'

// 🔥 normalize everything
const normalize = (res) => {
  return res?.data || res?.workouts || res || []
}

// ================= GET ALL =================
export const getWorkouts = async (params = {}) => {
  const { data } = await api.get('/workouts', { params })
  return normalize(data)
}

// ================= GET ONE =================
export const getWorkout = async (id) => {
  const { data } = await api.get(`/workouts/${id}`)
  return data?.data || data
}

// ================= CREATE =================
export const createWorkout = async (payload) => {
  const { data } = await api.post('/workouts', payload)
  return data?.data || data
}

// ================= UPDATE =================
export const updateWorkout = async (id, payload) => {
  const { data } = await api.put(`/workouts/${id}`, payload)
  return data?.data || data
}

// ================= DELETE =================
export const deleteWorkout = async (id) => {
  const { data } = await api.delete(`/workouts/${id}`)
  return data?.data || data
}

// ================= FAVORITE =================
export const toggleFavorite = async (id) => {
  const { data } = await api.patch(`/workouts/${id}/favorite`)
  return data?.data || data
}
