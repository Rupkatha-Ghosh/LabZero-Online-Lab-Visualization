import axios from 'axios';
import { safeLocalStorage } from '../utils/safeStorage';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

export const classroomsService = {
  // Get all classrooms for the logged-in user (Teacher's owned or Student's enrolled)
  getClassrooms: async () => {
    const token = safeLocalStorage.getItem('labzero_token');
    const response = await axios.get(`${API_URL}/classrooms/classrooms/`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  // Join a classroom using an invite code
  joinClassroom: async (code: string) => {
    const token = safeLocalStorage.getItem('labzero_token');
    const response = await axios.post(`${API_URL}/classrooms/join/`, { code }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  // Create a new classroom (Teachers only)
  createClassroom: async (name: string) => {
    const token = safeLocalStorage.getItem('labzero_token');
    const response = await axios.post(`${API_URL}/classrooms/classrooms/`, { name }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  // Get assignments for the user
  getAssignments: async () => {
    const token = safeLocalStorage.getItem('labzero_token');
    const response = await axios.get(`${API_URL}/classrooms/assignments/`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  // Delete a classroom (Teachers only)
  deleteClassroom: async (id: number) => {
    const token = safeLocalStorage.getItem('labzero_token');
    const response = await axios.delete(`${API_URL}/classrooms/classrooms/${id}/`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }
};
