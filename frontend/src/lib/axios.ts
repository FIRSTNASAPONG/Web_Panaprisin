import axios from 'axios';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL, // ต้องมั่นใจว่าใน .env.local เป็น http://localhost:8080/api
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json' // 🔴 เพิ่มบรรทัดนี้เข้าไป!
    },
});

api.interceptors.request.use((config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;