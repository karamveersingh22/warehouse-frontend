import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

// Attach token to every request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('wms_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Auth
export const loginUser = (username, password) =>
  api.post('/auth/login', { username, password })

// Products
export const getProducts  = ()           => api.get('/products')
export const getProduct   = (sku)        => api.get(`/products/${sku}`)
export const createProduct = (data)      => api.post('/products', data)
export const updateInventory = (sku, inventory) =>
  api.put(`/products/${sku}`, { inventory })

export default api
