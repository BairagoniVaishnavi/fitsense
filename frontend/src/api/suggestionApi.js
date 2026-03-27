import api from './axios'

export const getSuggestion = async (payload) => {
  const { data } = await api.post('/suggestion', payload)
  return data
}

export const getSuggestionTypes = async () => {
  const { data } = await api.get('/suggestion/types')
  return data
}
