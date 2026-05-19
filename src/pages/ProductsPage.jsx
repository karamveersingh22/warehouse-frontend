import { useState, useEffect, useCallback } from 'react'
import Navbar from '../components/Navbar'
import ProductTable from '../components/ProductTable'
import InventoryUpdateForm from '../components/InventoryUpdateForm'
import { getProducts } from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function ProductsPage() {
  const { user } = useAuth()
  const [products, setProducts]         = useState([])
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState('')
  const [editProduct, setEditProduct]   = useState(null)
  const [lastRefresh, setLastRefresh]   = useState(null)

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await getProducts()
      setProducts(res.data)
      setLastRefresh(new Date())
    } catch {
      setError('Failed to load products. Please refresh.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  const handleUpdateSuccess = () => {
    setEditProduct(null)
    fetchProducts()
  }

  return (
    <div className="min-h-screen bg-ink-950">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

        {/* Page header */}
        <div className="flex items-center justify-between mb-8 animate-fadeUp">
          <div>
            <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-100 tracking-tight">
              Products
            </h1>
            <p className="text-slate-500 font-body text-sm mt-1">
              {lastRefresh ? `Last updated ${lastRefresh.toLocaleTimeString()}` : 'Loading inventory...'}
            </p>
          </div>
          <button
            onClick={fetchProducts}
            disabled={loading}
            className="btn-secondary flex items-center gap-2"
          >
            <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-800/50 text-red-400 text-sm font-body px-4 py-3 rounded-xl mb-6">
            {error}
          </div>
        )}

        <div className="animate-fadeUp-delay-1">
          <ProductTable
            products={products}
            loading={loading}
            onEditClick={setEditProduct}
          />
        </div>

      </main>

      {/* Update modal - only managers see the update button so this is safe */}
      {editProduct && (
        <InventoryUpdateForm
          product={editProduct}
          onSuccess={handleUpdateSuccess}
          onCancel={() => setEditProduct(null)}
        />
      )}
    </div>
  )
}
