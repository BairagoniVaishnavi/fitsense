import api from './axios'

export const getAnalytics = async () => {
  const { data } = await api.get('/analytics')
  return data
}

export const getOverview = async () => {
  const { data } = await api.get('/analytics/overview')
  return data
}

export const getStreakInfo = async () => {
  const { data } = await api.get('/analytics/streak')
  return data
}

export const getBadges = async () => {
  const { data } = await api.get('/analytics/badges')
  return data
}
