import api from './axios'

export const loginUser = async (payload) => {
  const { data } = await api.post('/auth/login', payload)
  return data
}

export const registerUser = async (payload) => {
  const { data } = await api.post('/auth/register', payload)
  return data
}

export const getCurrentUser = async () => {
  const { data } = await api.get('/auth/me')
  return data
}

export const updateProfile = async (payload) => {
  const { data } = await api.put('/auth/profile', payload)
  return data
}

export const changePassword = async (payload) => {
  const { data } = await api.put('/auth/password', payload)
  return data
}
