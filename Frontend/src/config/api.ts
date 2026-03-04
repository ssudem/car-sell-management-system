export const API_URL = "http://localhost:5000/api"; // replace with your backend API URL

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
