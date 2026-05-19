import { useState } from 'react'
import { createProduct } from '../services/api'

const INITIAL = { sku_code: '', product_name: '', category: '', inventory: '' }

export default function ProductForm({ onSuccess }) {
  const [form, setForm]       = useState(INITIAL)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [success, setSuccess] = useState('')

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    setError('')
    setSuccess('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!form.sku_code.trim() || !form.category.trim() || form.inventory === '') {
      setError('SKU code, category and inventory are required.')
      return
    }
    if (parseInt(form.inventory) < 0) {
      setError('Inventory cannot be negative.')
      return
    }

    setLoading(true)
    try {
      await createProduct({
        sku_code:     form.sku_code.trim().toUpperCase(),
        product_name: form.product_name.trim() || null,
        category:     form.category.trim(),
        inventory:    parseInt(form.inventory),
      })
      setSuccess(`Product "${form.sku_code.toUpperCase()}" added successfully!`)
      setForm(INITIAL)
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

        <div>
          <label className="label">Initial Inventory *</label>
          <input
            name="inventory"
            type="number"
            min="0"
            value={form.inventory}
            onChange={handleChange}
            placeholder="e.g. 100"
            className="input-field"
          />
        </div>
      </div>

      <button type="submit" disabled={loading} className="btn-primary self-start">
        {loading ? 'Adding...' : 'Add Product'}
      </button>

    </form>
  )
}
