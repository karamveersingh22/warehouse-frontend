import { useMemo, useState, useEffect } from 'react'
import { updateInventory } from '../services/api'

const SIZE_ORDER = ['S', 'M', 'L', 'XL', '2XL', '3XL', '4XL']

function createEmptySizes() {
  return Object.fromEntries(SIZE_ORDER.map(s => [s, '0']))
}

export default function InventoryUpdateForm({ product, onSuccess, onCancel }) {
  const [sizes, setSizes]         = useState(createEmptySizes)
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')

  useEffect(() => {
    if (product) {
      const next = createEmptySizes()
      for (const size of SIZE_ORDER) {
        const val = product.sizes?.[size]
        next[size] = val === undefined || val === null ? '0' : String(val)
      }
      setSizes(next)
      setError('')
    }
  }, [product])

  if (!product) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    const sizesPayload = {}
    for (const size of SIZE_ORDER) {
      const raw = sizes?.[size] ?? '0'
      const n = raw === '' ? 0 : Number(raw)
      if (!Number.isFinite(n) || !Number.isInteger(n) || n < 0) {
        setError('Please enter valid non-negative integers for all sizes.')
        return
      }
      sizesPayload[size] = n
    }

    setLoading(true)
    try {
      await updateInventory(product.sku_code, sizesPayload)
      onSuccess?.()
    } catch (err) {
      const msg = err.response?.data?.detail || 'Update failed.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const totalUnits = useMemo(() => {
    return SIZE_ORDER.reduce((sum, size) => {
      const n = Number(sizes?.[size])
      return sum + (Number.isFinite(n) ? n : 0)
    }, 0)
  }, [sizes])

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/80 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onCancel() }}
    >
      <div className="card w-full max-w-md p-6 animate-fadeUp">

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
            <p className="font-mono font-medium text-amber-400">
              {(product.total_inventory ?? 0).toLocaleString()}
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-800/50 text-red-400 text-sm px-3 py-2.5 rounded-xl mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <p className="label">Sizes *</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {SIZE_ORDER.map((size, idx) => (
                <div key={size}>
                  <label className="text-slate-500 font-body text-xs block mb-2">{size}</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    inputMode="numeric"
                    value={sizes[size] ?? '0'}
                    onChange={e => {
                      setSizes(s => ({ ...s, [size]: e.target.value }))
                      setError('')
                    }}
                    className="input-field text-center font-mono"
                    autoFocus={idx === 0}
                  />
                </div>
              ))}
            </div>

            <div className="mt-3 bg-ink-900 rounded-xl px-4 py-3 flex items-center justify-between border border-ink-700">
              <span className="text-slate-500 font-body text-xs">Total</span>
              <span className="font-mono text-amber-400 text-sm">{totalUnits.toLocaleString()} units</span>
            </div>
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
