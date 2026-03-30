import api from './axios'

// universal normalizer
const normalize = (res) => {
  return res?.data || res?.workouts || res || []
}

export const getWorkouts = async (params = {}) => {
  const { data } = await api.get('/workouts', { params })
  return normalize(data)
}

export const getWorkout = async (id) => {
  const { data } = await api.get(`/workouts/${id}`)
  return data?.data || data
}

export const createWorkout = async (payload) => {
  const { data } = await api.post('/workouts', payload)
  return data?.data || data
}

export const updateWorkout = async (id, payload) => {
  const { data } = await api.put(`/workouts/${id}`, payload)
  return data?.data || data
}

export const deleteWorkout = async (id) => {
  const { data } = await api.delete(`/workouts/${id}`)
  return data?.data || data
}

export const toggleFavorite = async (id) => {
  const { data } = await api.patch(`/workouts/${id}/favorite`)
  return data?.data || data
}
