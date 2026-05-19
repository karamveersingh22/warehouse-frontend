import { useState, useEffect, useCallback } from 'react'
import Navbar from '../components/Navbar'
import ProductTable from '../components/ProductTable'
import ProductForm from '../components/ProductForm'
import InventoryUpdateForm from '../components/InventoryUpdateForm'
import { getProducts } from '../services/api'

export default function DashboardPage() {
  const [products, setProducts]       = useState([])
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState('')
  const [editProduct, setEditProduct] = useState(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [lastRefresh, setLastRefresh] = useState(null)

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await getProducts()
      setProducts(res.data)
      setLastRefresh(new Date())
    } catch {
      setError('Failed to load products.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  const handleProductAdded = () => {
    fetchProducts()
  }

  const handleUpdateSuccess = () => {
    setEditProduct(null)
    fetchProducts()
  }

  // Stats
  const totalProducts  = products.length
  const totalInventory = products.reduce((s, p) => s + p.inventory, 0)
  const lowStock       = products.filter(p => p.inventory <= 10).length
  const categories     = [...new Set(products.map(p => p.category))].length

  return (
    <div className="min-h-screen bg-ink-950">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

        {/* Page header */}
        <div className="flex items-center justify-between mb-8 animate-fadeUp">
          <div>
            <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-100 tracking-tight">
              Dashboard
            </h1>
            <p className="text-slate-500 font-body text-sm mt-1">
              {lastRefresh ? `Last updated ${lastRefresh.toLocaleTimeString()}` : 'Loading...'}
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

        {/* Stats row */}
        {!loading && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8 animate-fadeUp-delay-1">
            {[
              { label: 'Total Products',   value: totalProducts,            color: 'text-slate-200' },
              { label: 'Total Inventory',  value: totalInventory.toLocaleString(), color: 'text-amber-400' },
              { label: 'Low Stock (≤10)',  value: lowStock,                 color: lowStock > 0 ? 'text-red-400' : 'text-green-400' },
              { label: 'Categories',       value: categories,               color: 'text-blue-400' },
            ].map(stat => (
              <div key={stat.label} className="card p-4">
                <p className="text-slate-500 font-body text-xs mb-1">{stat.label}</p>
                <p className={`font-display font-bold text-2xl ${stat.color}`}>{stat.value}</p>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="bg-red-900/20 border border-red-800/50 text-red-400 text-sm font-body px-4 py-3 rounded-xl mb-6">
            {error}
          </div>
        )}

        {/* Add Product Section */}
        <div className="card mb-8 animate-fadeUp-delay-2">
          <button
            onClick={() => setShowAddForm(s => !s)}
            className="w-full flex items-center justify-between px-6 py-4 hover:bg-ink-700/30 transition-colors rounded-2xl"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-amber-400/10 border border-amber-400/20 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <span className="font-display font-bold text-slate-200">Add New Product</span>
            </div>
            <svg
              className={`w-5 h-5 text-slate-500 transition-transform duration-200 ${showAddForm ? 'rotate-180' : ''}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showAddForm && (
            <div className="px-6 pb-6 border-t border-ink-700 pt-5">
              <ProductForm onSuccess={handleProductAdded} />
            </div>
          )}
        </div>

        {/* Products Table */}
        <div className="animate-fadeUp-delay-3">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-xl text-slate-200">Inventory</h2>
            <span className="text-slate-500 font-mono text-xs">{totalProducts} products</span>
          </div>
          <ProductTable
            products={products}
            loading={loading}
            onEditClick={setEditProduct}
          />
        </div>

      </main>

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
