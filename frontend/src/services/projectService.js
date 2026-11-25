import api from './api';

export const getProjects = async (params = {}) => {
  const { data } = await api.get('/projects', { params });
  return data;
};

export const getProjectById = async (id) => {
  const { data } = await api.get(`/projects/${id}`);
  return data;
};

export const createProject = async (payload) => {
  const { data } = await api.post('/projects', payload);
  return data;
};

export const updateProject = async (id, payload) => {
  const { data } = await api.put(`/projects/${id}`, payload);
  return data;
};

export const deleteProject = async (id) => {
  const { data } = await api.delete(`/projects/${id}`);
  return data;
};

export const addProjectMember = async (projectId, payload) => {
  const { data } = await api.post(`/projects/${projectId}/members`, payload);
  return data;
};

export const removeProjectMember = async (projectId, userId) => {
  const { data } = await api.delete(`/projects/${projectId}/members/${userId}`);
  return data;
};
