import { useState, useEffect } from 'react'
import { updateInventory } from '../services/api'

export default function InventoryUpdateForm({ product, onSuccess, onCancel }) {
  const [inventory, setInventory] = useState('')
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')

  useEffect(() => {
    if (product) {
      setInventory(product.inventory.toString())
      setError('')
    }
  }, [product])

  if (!product) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    const val = parseInt(inventory)
    if (isNaN(val) || val < 0) {
      setError('Please enter a valid non-negative number.')
      return
    }

    setLoading(true)
    try {
      await updateInventory(product.sku_code, val)
      onSuccess?.()
    } catch (err) {
      const msg = err.response?.data?.detail || 'Update failed.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/80 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onCancel() }}
    >
      <div className="card w-full max-w-sm p-6 animate-fadeUp">

        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="font-display font-bold text-slate-100 text-lg">Update Inventory</h3>
            <p className="text-slate-500 font-mono text-xs mt-1">{product.sku_code}</p>
          </div>
          <button
            onClick={onCancel}
            className="text-slate-500 hover:text-slate-300 transition-colors p-1"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Product info */}
        <div className="bg-ink-900 rounded-xl p-3 mb-5 flex items-center justify-between">
          <div>
            <p className="text-slate-200 font-body text-sm">{product.product_name || product.sku_code}</p>
            <p className="text-slate-500 font-body text-xs mt-0.5">{product.category}</p>
          </div>
          <div className="text-right">
            <p className="text-slate-500 text-xs font-body">Current</p>
            <p className="font-mono font-medium text-amber-400">{product.inventory.toLocaleString()}</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-800/50 text-red-400 text-sm px-3 py-2.5 rounded-xl mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="label">New Inventory *</label>
            <input
              type="number"
              min="0"
              value={inventory}
              onChange={e => { setInventory(e.target.value); setError('') }}
              className="input-field text-center text-lg font-mono"
              autoFocus
            />
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={onCancel} className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>

      </div>
    </div>
  )
}
