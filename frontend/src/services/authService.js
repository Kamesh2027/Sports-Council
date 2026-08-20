import { apiRequest } from './api';

export async function login(credentials) {
  const response = await apiRequest('/api/login', {
    method: 'POST',
    body: credentials,
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.message || 'Login failed.');
  }

  return payload;
}

export async function registerStudent(payload) {
  const response = await apiRequest('/api/register', {
    method: 'POST',
    body: payload,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Registration failed.');
  }

  return data;
}

export async function fetchPendingStudents(token) {
  const response = await apiRequest('/api/admin/students/pending', {
    method: 'GET',
    token,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Unable to load pending students.');
  }

  return data;
}

export async function approveStudent(studentId, token) {
  const response = await apiRequest(`/api/admin/students/${studentId}/approve`, {
    method: 'PATCH',
    token,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Unable to approve student.');
  }

  return data;
}
