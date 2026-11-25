import api from './api';

export const getDashboardStats = async () => {
  const { data } = await api.get('/dashboard/stats');
  return data;
};

export const getRecentProjects = async () => {
  const { data } = await api.get('/dashboard/recent-projects');
  return data;
};

export const getDashboardMyTasks = async () => {
  const { data } = await api.get('/dashboard/my-tasks');
  return data;
};

export const getProductivity = async () => {
  const { data } = await api.get('/dashboard/productivity');
  return data;
};
