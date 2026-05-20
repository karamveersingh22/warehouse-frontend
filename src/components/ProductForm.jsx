import { useMemo, useState } from 'react'
import { createProduct } from '../services/api'

const SIZE_ORDER = ['S', 'M', 'L', 'XL', '2XL', '3XL', '4XL']

function createInitialForm() {
  return {
    sku_code: '',
    product_name: '',
    category: '',
    sizes: Object.fromEntries(SIZE_ORDER.map(s => [s, '0'])),
  }
}

export default function ProductForm({ onSuccess }) {
  const [form, setForm]       = useState(createInitialForm)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [success, setSuccess] = useState('')

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    setError('')
    setSuccess('')
  }

  const handleSizeChange = (size) => (e) => {
    setForm(f => ({
      ...f,
      sizes: { ...f.sizes, [size]: e.target.value },
    }))
    setError('')
    setSuccess('')
  }

  const totalUnits = useMemo(() => {
    return SIZE_ORDER.reduce((sum, size) => {
      const n = Number(form.sizes?.[size])
      return sum + (Number.isFinite(n) ? n : 0)
    }, 0)
  }, [form.sizes])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!form.sku_code.trim() || !form.category.trim()) {
      setError('SKU code and category are required.')
      return
    }

    const sizesPayload = {}
    for (const size of SIZE_ORDER) {
      const raw = form.sizes?.[size] ?? '0'
      const n = raw === '' ? 0 : Number(raw)
      if (!Number.isFinite(n) || !Number.isInteger(n) || n < 0) {
        setError('All size quantities must be non-negative integers.')
        return
      }
      sizesPayload[size] = n
    }

    setLoading(true)
    try {
      await createProduct({
        sku_code:     form.sku_code.trim().toUpperCase(),
        product_name: form.product_name.trim() || null,
        category:     form.category.trim(),
        sizes:        sizesPayload,
      })
      setSuccess(`Product "${form.sku_code.toUpperCase()}" added successfully!`)
      setForm(createInitialForm())
      onSuccess?.()
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to add product.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">

      {error && (
        <div className="bg-red-900/20 border border-red-800/50 text-red-400 text-sm font-body px-4 py-3 rounded-xl">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-900/20 border border-green-800/50 text-green-400 text-sm font-body px-4 py-3 rounded-xl">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="label">SKU Code *</label>
          <input
            name="sku_code"
            value={form.sku_code}
            onChange={handleChange}
            placeholder="e.g. SKU001"
            className="input-field uppercase"
            maxLength={50}
          />
        </div>

        <div>
          <label className="label">Product Name</label>
          <input
            name="product_name"
            value={form.product_name}
            onChange={handleChange}
            placeholder="e.g. Blue T-Shirt"
            className="input-field"
            maxLength={100}
          />
        </div>

        <div>
          <label className="label">Category *</label>
          <input
            name="category"
            value={form.category}
            onChange={handleChange}
            placeholder="e.g. Apparel"
            className="input-field"
            maxLength={60}
          />
        </div>
      </div>

      <div>
        <p className="label">Sizes *</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {SIZE_ORDER.map(size => (
            <div key={size}>
              <label className="text-slate-500 font-body text-xs block mb-2">{size}</label>
              <input
                type="number"
                min="0"
                step="1"
                inputMode="numeric"
                value={form.sizes[size] ?? '0'}
                onChange={handleSizeChange(size)}
                className="input-field text-center font-mono"
                placeholder="0"
              />
            </div>
          ))}
        </div>

        <div className="mt-3 bg-ink-900 rounded-xl px-4 py-3 flex items-center justify-between border border-ink-700">
          <span className="text-slate-500 font-body text-xs">Total</span>
          <span className="font-mono text-amber-400 text-sm">{totalUnits.toLocaleString()} units</span>
        </div>
      </div>

      <button type="submit" disabled={loading} className="btn-primary self-start">
        {loading ? 'Adding...' : 'Add Product'}
      </button>

    </form>
  )
}
