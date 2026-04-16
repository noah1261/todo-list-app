import axios from 'axios';

// 1. יצירת Instance ספציפי ל-API שלנו
const apiClient = axios.create({
 baseURL: process.env.REACT_APP_API_URL || "http://localhost:5016"
});

apiClient.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // ✅ הוסף את הטוקן!
    }
    return config;
  },
  error => Promise.reject(error)
);

// ✅ Response interceptor - טיפול בשגיאות וטוקן שפג התוקף
apiClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      console.warn("Token expired or invalid - logging out...");
      localStorage.removeItem('token');
      window.location.href = '/login'; 
    }
    
    console.error("API Error:", error.message);
    return Promise.reject(error);
  }
);


export default {
  login: async (email, password) => {
    const res = await apiClient.post('/login', { email, password });
    if (res.data.token) localStorage.setItem('token', res.data.token);
    return res.data;
  },
  register: async (email, username, password) => {
    return await apiClient.post('/register', { email, username, password });
  },
  getTasks: async () => {
    const res = await apiClient.get('/items');
    return res.data;
  },

  addTask: async (name) => {
    console.log('addTask', { name: name, isComplete: false })
    const result = await apiClient.post(`/items`, { name, isComplete: false })
    return result.data;
  },

  setCompleted: async (id, isComplete,name) => {
    console.log('setCompleted', { id, isComplete })
    const result = await apiClient.put(`/items/${id}`, {id ,isComplete,name})
    return result.data;
  },

  deleteTask: async (id) => {
    console.log('deleteTask')
    const result = await apiClient.delete(`/items/${id}`)
    return result.data;
  }
};
