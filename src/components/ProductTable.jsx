import { useState, useMemo } from 'react'
import { useAuth } from '../context/AuthContext'

function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function SkeletonRow() {
  return (
    <tr>
      {[1,2,3,4,5].map(i => (
        <td key={i} className="px-4 py-4">
          <div className="skeleton h-4 w-full" />
        </td>
      ))}
    </tr>
  )
}

export default function ProductTable({ products, loading, onEditClick }) {
  const { user } = useAuth()
  const [search, setSearch]         = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [sortKey, setSortKey]       = useState('latest_updated_date')
  const [sortDir, setSortDir]       = useState('desc')

  const categories = useMemo(() => {
    const cats = [...new Set(products.map(p => p.category).filter(Boolean))]
    return cats.sort()
  }, [products])

  const filtered = useMemo(() => {
    let list = [...products]

    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(p =>
        p.sku_code.toLowerCase().includes(q) ||
        (p.product_name || '').toLowerCase().includes(q)
      )
    }

    if (categoryFilter) {
      list = list.filter(p => p.category === categoryFilter)
    }

    list.sort((a, b) => {
      let va = a[sortKey], vb = b[sortKey]
      if (sortKey === 'latest_updated_date') {
        va = new Date(va); vb = new Date(vb)
      }
      if (va < vb) return sortDir === 'asc' ? -1 : 1
      if (va > vb) return sortDir === 'asc' ? 1 : -1
      return 0
    })

    return list
  }, [products, search, categoryFilter, sortKey, sortDir])

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('desc') }
  }

  const SortIcon = ({ col }) => {
    if (sortKey !== col) return <span className="text-ink-600 ml-1">↕</span>
    return <span className="text-amber-400 ml-1">{sortDir === 'asc' ? '↑' : '↓'}</span>
  }

  return (
    <div className="flex flex-col gap-4">

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search by SKU or product name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-field !pl-9"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          className="input-field sm:w-48"
        >
          <option value="">All Categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-slate-500 font-mono text-xs">
          {loading ? 'Loading...' : `${filtered.length} product${filtered.length !== 1 ? 's' : ''} found`}
        </p>
        {(search || categoryFilter) && (
          <button
            onClick={() => { setSearch(''); setCategoryFilter('') }}
            className="text-amber-400 font-body text-xs hover:underline"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Desktop Table */}
      <div className="card overflow-hidden hidden md:block">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink-700 bg-ink-900/50">
                <th className="text-left px-4 py-3 font-display text-xs font-semibold text-slate-400 uppercase tracking-wider">SKU Code</th>
                <th className="text-left px-4 py-3 font-display text-xs font-semibold text-slate-400 uppercase tracking-wider">Product Name</th>
                <th className="text-left px-4 py-3 font-display text-xs font-semibold text-slate-400 uppercase tracking-wider">Category</th>
                <th
                  className="text-left px-4 py-3 font-display text-xs font-semibold text-slate-400 uppercase tracking-wider cursor-pointer hover:text-amber-400 transition-colors select-none"
                  onClick={() => toggleSort('inventory')}
                >
                  Inventory <SortIcon col="inventory" />
                </th>
                <th
                  className="text-left px-4 py-3 font-display text-xs font-semibold text-slate-400 uppercase tracking-wider cursor-pointer hover:text-amber-400 transition-colors select-none"
                  onClick={() => toggleSort('latest_updated_date')}
                >
                  Last Updated <SortIcon col="latest_updated_date" />
                </th>
                {user?.role === 'manager' && (
                  <th className="text-left px-4 py-3 font-display text-xs font-semibold text-slate-400 uppercase tracking-wider">Action</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-700">
              {loading ? (
                Array(5).fill(0).map((_, i) => <SkeletonRow key={i} />)
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={user?.role === 'manager' ? 6 : 5} className="px-4 py-12 text-center">
                    <p className="text-slate-500 font-body">No products found</p>
                  </td>
                </tr>
              ) : (
                filtered.map((p, i) => (
                  <tr
                    key={p.sku_code}
                    className="hover:bg-ink-700/40 transition-colors animate-fadeUp"
                    style={{ animationDelay: `${i * 0.03}s` }}
                  >
                    <td className="px-4 py-4">
                      <span className="font-mono text-amber-400 text-xs bg-amber-400/10 px-2 py-1 rounded-lg">
                        {p.sku_code}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-slate-200 font-body">
                      {p.product_name || <span className="text-slate-600 italic text-xs">—</span>}
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-xs bg-ink-700 text-slate-300 px-2 py-1 rounded-lg border border-ink-600">
                        {p.category}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`font-mono font-medium text-sm ${p.inventory <= 10 ? 'text-red-400' : p.inventory <= 50 ? 'text-yellow-400' : 'text-green-400'}`}>
                        {p.inventory.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-slate-400 font-body text-xs">
                      {formatDate(p.latest_updated_date)}
                    </td>
                    {user?.role === 'manager' && (
                      <td className="px-4 py-4">
                        <button
                          onClick={() => onEditClick(p)}
                          className="text-xs text-amber-400 hover:text-amber-300 border border-amber-400/30 hover:border-amber-400 px-3 py-1.5 rounded-lg transition-all"
                        >
                          Update
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="flex flex-col gap-3 md:hidden">
        {loading ? (
          Array(3).fill(0).map((_, i) => (
            <div key={i} className="card p-4 flex flex-col gap-3">
              <div className="skeleton h-4 w-1/3" />
              <div className="skeleton h-4 w-2/3" />
              <div className="skeleton h-4 w-1/2" />
            </div>
          ))
        ) : filtered.length === 0 ? (
          <div className="card p-10 text-center">
            <p className="text-slate-500 font-body">No products found</p>
          </div>
        ) : (
          filtered.map((p, i) => (
            <div
              key={p.sku_code}
              className="card p-4 flex flex-col gap-3 animate-fadeUp"
              style={{ animationDelay: `${i * 0.04}s` }}
            >
              <div className="flex items-start justify-between">
                <span className="font-mono text-amber-400 text-xs bg-amber-400/10 px-2 py-1 rounded-lg">
                  {p.sku_code}
                </span>
                <span className={`font-mono font-medium text-sm ${p.inventory <= 10 ? 'text-red-400' : p.inventory <= 50 ? 'text-yellow-400' : 'text-green-400'}`}>
                  {p.inventory.toLocaleString()} units
                </span>
              </div>

              {p.product_name && (
                <p className="text-slate-200 font-body font-medium">{p.product_name}</p>
              )}

              <div className="flex items-center justify-between">
                <span className="text-xs bg-ink-700 text-slate-300 px-2 py-1 rounded-lg border border-ink-600">
                  {p.category}
                </span>
                <span className="text-slate-500 font-body text-xs">
                  {formatDate(p.latest_updated_date)}
                </span>
              </div>

              {user?.role === 'manager' && (
                <button
                  onClick={() => onEditClick(p)}
                  className="w-full text-center text-xs text-amber-400 hover:text-amber-300 border border-amber-400/30 hover:border-amber-400 px-3 py-2 rounded-lg transition-all mt-1"
                >
                  Update Inventory
                </button>
              )}
            </div>
          ))
        )}
      </div>

    </div>
  )
}
