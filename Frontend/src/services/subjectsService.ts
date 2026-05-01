import axios from 'axios';
import { Subject } from '../types/types';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

const CACHE_KEY = 'labzero_subjects_cache';

export const getSubjects = async (): Promise<Subject[]> => {
  try {
    const response = await axios.get<Subject[]>(`${API_URL}/subjects/`);
    return response.data;
  } catch (error) {
    console.error("Error fetching subjects:", error);
    throw error;
  }
};
