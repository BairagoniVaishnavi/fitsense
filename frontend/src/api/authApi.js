import api from './axios'

// LOGIN
export const loginUser = async (payload) => {
  const { data } = await api.post('/auth/login', payload)
  return data
}

// REGISTER
export const registerUser = async (payload) => {
  const { data } = await api.post('/auth/register', payload)
  return data
}

// CURRENT USER
export const getCurrentUser = async () => {
  const { data } = await api.get('/auth/me')
  return data
}

// UPDATE PROFILE
export const updateProfile = async (payload) => {
  const { data } = await api.put('/auth/profile', payload)
  return data
}

// CHANGE PASSWORD
export const changePassword = async (payload) => {
  const { data } = await api.put('/auth/password', payload)
  return data
}
