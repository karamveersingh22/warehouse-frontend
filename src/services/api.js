import axios from 'axios'

const DEFAULT_DEV_API = 'http://127.0.0.1:8000'
const DEFAULT_PROD_API = 'https://warehouse-backend-qu8m.onrender.com'

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.PROD ? DEFAULT_PROD_API : DEFAULT_DEV_API)

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
export const updateInventory = (sku, sizes) =>
  api.put(`/products/${sku}`, { sizes })

export default api
