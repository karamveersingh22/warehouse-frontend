import { useState, useMemo } from 'react'
import { useAuth } from '../context/AuthContext'

const SIZE_ORDER = ['S', 'M', 'L', 'XL', '2XL', '3XL', '4XL']

function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function SkeletonRow({ colCount }) {
  return (
    <tr>
      {Array.from({ length: colCount }).map((_, i) => (
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

  const isManager = user?.role === 'manager'
  const colCount = 1 + SIZE_ORDER.length + 2 + (isManager ? 1 : 0)

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
        va = new Date(va || 0); vb = new Date(vb || 0)
      }
      if (sortKey === 'total_inventory') {
        va = Number(va ?? 0); vb = Number(vb ?? 0)
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

      {/* Matrix Table (same UI for manager + worker) */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink-700 bg-ink-900/50">
                <th
                  className="sticky top-16 left-0 z-30 bg-ink-900/95 backdrop-blur-md text-left px-4 py-3 font-display text-xs font-semibold text-slate-400 uppercase tracking-wider"
                >
                  Product
                </th>

                {SIZE_ORDER.map(size => (
                  <th
                    key={size}
                    className="sticky top-16 z-20 bg-ink-900/95 backdrop-blur-md text-center px-3 py-3 font-display text-xs font-semibold text-slate-400 uppercase tracking-wider"
                  >
                    {size}
                  </th>
                ))}

                <th
                  className="sticky top-16 z-20 bg-ink-900/95 backdrop-blur-md text-center px-3 py-3 font-display text-xs font-semibold text-slate-400 uppercase tracking-wider cursor-pointer hover:text-amber-400 transition-colors select-none"
                  onClick={() => toggleSort('total_inventory')}
                >
                  Total <SortIcon col="total_inventory" />
                </th>

                <th
                  className="sticky top-16 z-20 bg-ink-900/95 backdrop-blur-md text-center px-3 py-3 font-display text-xs font-semibold text-slate-400 uppercase tracking-wider cursor-pointer hover:text-amber-400 transition-colors select-none"
                  onClick={() => toggleSort('latest_updated_date')}
                >
                  Updated <SortIcon col="latest_updated_date" />
                </th>

                {isManager && (
                  <th
                    className="sticky top-16 z-20 bg-ink-900/95 backdrop-blur-md text-center px-3 py-3 font-display text-xs font-semibold text-slate-400 uppercase tracking-wider"
                  >
                    Action
                  </th>
                )}
              </tr>
            </thead>

            <tbody className="divide-y divide-ink-700">
              {loading ? (
                Array(8).fill(0).map((_, i) => <SkeletonRow key={i} colCount={colCount} />)
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={colCount} className="px-4 py-12 text-center">
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
                    <td className="sticky left-0 z-10 bg-ink-800 px-4 py-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-amber-400 text-xs bg-amber-400/10 px-2 py-1 rounded-lg">
                            {p.sku_code}
                          </span>
                          <span className="text-xs bg-ink-700 text-slate-300 px-2 py-1 rounded-lg border border-ink-600">
                            {p.category}
                          </span>
                        </div>
                        <p className="text-slate-200 font-body text-sm">
                          {p.product_name || <span className="text-slate-600 italic text-xs">—</span>}
                        </p>
                      </div>
                    </td>

                    {SIZE_ORDER.map(size => (
                      <td key={size} className="px-3 py-4 text-center">
                        <span className="font-mono text-slate-200 text-sm">
                          {(p.sizes?.[size] ?? 0).toLocaleString()}
                        </span>
                      </td>
                    ))}

                    <td className="px-3 py-4 text-center">
                      <span
                        className={`font-mono font-medium text-sm ${(p.total_inventory ?? 0) <= 10 ? 'text-red-400' : (p.total_inventory ?? 0) <= 50 ? 'text-yellow-400' : 'text-green-400'}`}
                      >
                        {(p.total_inventory ?? 0).toLocaleString()}
                      </span>
                    </td>

                    <td className="px-3 py-4 text-center text-slate-400 font-body text-xs whitespace-nowrap">
                      {formatDate(p.latest_updated_date)}
                    </td>

                    {isManager && (
                      <td className="px-3 py-4 text-center">
                        <button
                          onClick={() => onEditClick(p)}
                          className="text-xs text-amber-400 hover:text-amber-300 border border-amber-400/30 hover:border-amber-400 px-3 py-2 rounded-lg transition-all"
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

    </div>
  )
}
