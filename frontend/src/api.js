// src/api.js
import axios from "axios";

const API = "http://localhost:5000";

function getToken() { return localStorage.getItem("token"); }
function authHeaders() {
  const t = getToken();
  return t ? { headers: { Authorization: `Bearer ${t}` } } : {};
}

export const login = (data) => axios.post(`${API}/auth/login`, data);
export const register = (data) => axios.post(`${API}/auth/register`, data);
export const getStock = () => axios.get(`${API}/stock`, authHeaders());
export const addItem = (data) => axios.post(`${API}/stock`, data, authHeaders());
export const updateItem = (id, data) => axios.put(`${API}/stock/${id}`, data, authHeaders());
export const deleteItem = (id) => axios.delete(`${API}/stock/${id}`, authHeaders());
export const scanBarcode = (payload) => axios.post(`${API}/stock/scan`, payload, authHeaders());
export const exportExcel = () => axios.get(`${API}/export/excel`, { ...authHeaders(), responseType: 'blob' });
export const exportPDF = () => axios.get(`${API}/export/pdf`, { ...authHeaders(), responseType: 'blob' });
export const exportTally = () => axios.get(`${API}/export/tally`, { ...authHeaders(), responseType: 'blob' });
export const checkLowStock = () => axios.post(`${API}/check-low-stock`, {}, authHeaders());
export const syncSupabase = () => axios.post(`${API}/sync/supabase`, {}, authHeaders());
