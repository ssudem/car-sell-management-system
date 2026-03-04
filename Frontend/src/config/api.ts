export const API_URL = 'https://car-sell-management-system.onrender.com/api'; // 'http://localhost:5000/api';

export const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
        "Content-Type": "application/json",
        ...(token ? { "Authorization": `Bearer ${token}` } : {})
    };
};

export const getMultipartHeaders = () => {
    const token = localStorage.getItem("token");
    return {
        ...(token ? { "Authorization": `Bearer ${token}` } : {})
    };
};
