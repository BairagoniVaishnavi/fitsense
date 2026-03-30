import api from './axios'

const normalize = (res) => {
  return res?.data || res?.plan || res?.suggestion || res || null
}

export const getSuggestion = async (payload) => {
  const { data } = await api.post('/suggestion', payload)
  return normalize(data)
}

export const getSuggestionTypes = async () => {
  const { data } = await api.get('/suggestion/types')
  return data?.data || data
}
