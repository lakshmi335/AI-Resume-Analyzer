import api from './axios';

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

export const resumeAPI = {
  upload: (formData) =>
    api.post('/resume/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getAll: () => api.get('/resume'),
  getOne: (id) => api.get(`/resume/${id}`),
  delete: (id) => api.delete(`/resume/${id}`),
  compare: (data) => api.post('/resume/compare', data),
  buildFromJD: (data) => api.post('/resume/build', data),
};

export const interviewAPI = {
  start: (data) => api.post('/interview/start', data),
  sendMessage: (id, message) => api.post(`/interview/${id}/message`, { message }),
  end: (id) => api.post(`/interview/${id}/end`),
  getAll: () => api.get('/interview'),
  getOne: (id) => api.get(`/interview/${id}`),
};
