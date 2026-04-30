import { useState, useMemo } from 'react'
import { FiSearch, FiChevronLeft, FiChevronRight, FiChevronUp, FiChevronDown } from 'react-icons/fi'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface Column {
  key: string
  header: string
  render?: (item: any) => React.ReactNode
  sortable?: boolean
}

interface DataTableProps {
  columns: Column[]
  data: any[]
  pageSize?: number
  searchable?: boolean
  searchPlaceholder?: string
  onRowClick?: (item: any) => void
  emptyMessage?: string
}

export default function DataTable({
  columns, data, pageSize = 10, searchable = true,
  searchPlaceholder = 'Buscar...',
  onRowClick,
  emptyMessage = 'Nenhum registro encontrado',
}: DataTableProps) {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

  const filtered = useMemo(() => {
    if (!search) return data
    const term = search.toLowerCase()
    return data.filter((item: any) => columns.some(col => { const val = item[col.key]; return val != null && String(val).toLowerCase().includes(term) }))
  }, [data, search, columns])

  const sorted = useMemo(() => {
    if (!sortKey) return filtered
    return [...filtered].sort((a: any, b: any) => { const aVal = a[sortKey]; const bVal = b[sortKey]; if (aVal == null) return 1; if (bVal == null) return -1; const cmp = String(aVal).localeCompare(String(bVal), 'pt-BR', { numeric: true }); return sortDir === 'asc' ? cmp : -cmp })
  }, [filtered, sortKey, sortDir])

  const totalPages = Math.ceil(sorted.length / pageSize)
  const paged = sorted.slice(page * pageSize, (page + 1) * pageSize)

  const handleSort = (key: string) => { if (sortKey === key) { setSortDir(d => d === 'asc' ? 'desc' : 'asc') } else { setSortKey(key); setSortDir('asc') } }

  return (
    <div className="card overflow-hidden">
      {searchable && (<div className="px-4 py-3 border-b border-gray-100"><div className="relative"><FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" /><input type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(0) }} placeholder={searchPlaceholder} className="input-field pl-9" /></div></div>)}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100"><tr>{columns.map(col => (<th key={col.key} className={`text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider ${col.sortable !== false ? 'cursor-pointer select-none hover:text-gray-700' : ''}`} onClick={() => col.sortable !== false && handleSort(col.key)}><div className="flex items-center gap-1">{col.header}{sortKey === col.key && (sortDir === 'asc' ? <FiChevronUp className="w-3 h-3" /> : <FiChevronDown className="w-3 h-3" />)}</div></th>))}</tr></thead>
          <tbody className="divide-y divide-gray-50">{paged.length === 0 ? (<tr><td colSpan={columns.length} className="px-4 py-8 text-center text-gray-400 text-sm">{emptyMessage}</td></tr>) : (paged.map((item: any, i: number) => (<tr key={i} className={`hover:bg-gray-50 transition-colors ${onRowClick ? 'cursor-pointer' : ''} ${i % 2 === 1 ? 'bg-gray-50/50' : ''}`} onClick={() => onRowClick?.(item)}>{columns.map(col => (<td key={col.key} className="px-4 py-3 text-sm text-gray-700">{col.render ? col.render(item) : String(item[col.key] ?? '-')}</td>))}</tr>)))}</tbody>
        </table>
      </div>
      {totalPages > 1 && (<div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between"><p className="text-xs text-gray-500">{sorted.length} registro(s) - Página {page + 1} de {totalPages}</p><div className="flex gap-1"><button disabled={page === 0} onClick={() => setPage(p => p - 1)} className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-30"><FiChevronLeft className="w-4 h-4" /></button><button disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)} className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-30"><FiChevronRight className="w-4 h-4" /></button></div></div>)}
    </div>
  )
}