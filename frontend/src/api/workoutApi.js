import api from "./axios"

// ================= SAFE NORMALIZER =================
const normalize = (res) => {
  if (Array.isArray(res)) return res
  if (Array.isArray(res?.data)) return res.data
  if (Array.isArray(res?.workouts)) return res.workouts
  return []
}

// ================= GET ALL =================
export const getWorkouts = async (params = {}) => {
  const res = await api.get("/workouts", { params })
  return normalize(res.data)
}

// ================= GET ONE =================
export const getWorkout = async (id) => {
  const res = await api.get(`/workouts/${id}`)
  return res.data?.data || res.data
}

// ================= CREATE =================
export const createWorkout = async (payload) => {
  const res = await api.post("/workouts", payload)
  return res.data?.data || res.data
}

// ================= UPDATE =================
export const updateWorkout = async (id, payload) => {
  const res = await api.put(`/workouts/${id}`, payload)
  return res.data?.data || res.data
}

// ================= DELETE =================
export const deleteWorkout = async (id) => {
  const res = await api.delete(`/workouts/${id}`)
  return res.data?.data || res.data
}
