import api from './api';

export const getProfile = async () => {
  const { data } = await api.get('/users/profile');
  return data;
};

export const updateProfile = async (formData) => {
  const isFormData = formData instanceof FormData;
  const { data } = await api.put('/users/profile', formData, {
    headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
  });
  return data;
};

export const searchUsersByEmail = async (email) => {
  const { data } = await api.get('/users/search', { params: { email } });
  return data;
};

export const getTeamOverview = async () => {
  const { data } = await api.get('/users/team');
  return data;
};
