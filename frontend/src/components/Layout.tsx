import { useState, useEffect } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Breadcrumbs from './Breadcrumbs'
import { accessRequestStorage } from '../services/storage'
import {
  FiGrid, FiFolder, FiTruck, FiUsers, FiClipboard,
  FiDroplet, FiTool, FiDollarSign, FiBarChart2,
  FiMenu, FiX, FiBell, FiLogOut, FiChevronLeft, FiUserCheck,
} from 'react-icons/fi'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: FiGrid },
  { to: '/projects', label: 'Obras', icon: FiFolder },
  { to: '/machines', label: 'Máquinas', icon: FiTruck },
  { to: '/employees', label: 'Colaboradores', icon: FiUsers },
  { to: '/production', label: 'Apontamentos', icon: FiClipboard },
  { to: '/fueling', label: 'Combustível', icon: FiDroplet },
  { to: '/maintenance', label: 'Manutenção', icon: FiTool },
  { to: '/financial', label: 'Financeiro', icon: FiDollarSign },
  { to: '/reports', label: 'Relatórios', icon: FiBarChart2 },
]

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [pendingCount, setPendingCount] = useState(0)

  const isAdmin = user?.role === 'ADMIN'

  useEffect(() => {
    if (isAdmin) {
      const count = accessRequestStorage.getAll().filter(r => r.status === 'PENDING').length
      setPendingCount(count)
    }
  }, [isAdmin])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="flex h-screen bg-[#f5f7fa]">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        ${collapsed ? 'w-16' : 'w-64'} 
        bg-[#1e3a5f] text-white flex flex-col
        transform transition-all duration-200 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className={`p-4 border-b border-white/10 flex items-center ${collapsed ? 'justify-center' : 'justify-between'}`}>
          {!collapsed && (
            <div>
              <h1 className="text-lg font-bold text-white">Terraplanagem</h1>
              <p className="text-xs text-blue-200 mt-0.5">Sistema de Gestão</p>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex p-1 hover:bg-white/10 rounded transition-colors"
          >
            <FiChevronLeft className={`w-4 h-4 transition-transform ${collapsed ? 'rotate-180' : ''}`} />
          </button>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 hover:bg-white/10 rounded"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-white/20 text-white font-medium'
                    : 'text-blue-100 hover:bg-white/10 hover:text-white'
                } ${collapsed ? 'justify-center' : ''}`
              }
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          ))}

          {/* Access Requests - ADMIN only */}
          {isAdmin && (
            <NavLink
              to="/access-requests"
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-white/20 text-white font-medium'
                    : 'text-blue-100 hover:bg-white/10 hover:text-white'
                } ${collapsed ? 'justify-center' : ''}`
              }
              title={collapsed ? 'Solicitações de Acesso' : undefined}
            >
              <div className="relative flex-shrink-0">
                <FiUserCheck className="w-5 h-5" />
                {pendingCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-yellow-400 text-yellow-900 text-[10px] font-bold rounded-full flex items-center justify-center">
                    {pendingCount > 9 ? '9+' : pendingCount}
                  </span>
                )}
              </div>
              {!collapsed && (
                <span className="flex items-center gap-2">
                  Solicitações de Acesso
                  {pendingCount > 0 && (
                    <span className="bg-yellow-400 text-yellow-900 text-xs font-bold px-1.5 py-0.5 rounded-full">
                      {pendingCount}
                    </span>
                  )}
                </span>
              )}
            </NavLink>
          )}
        </nav>

        <div className={`p-3 border-t border-white/10 ${collapsed ? 'text-center' : ''}`}>
          {!collapsed && (
            <div className="text-sm text-blue-100 mb-2 px-1">
              <p className="font-medium text-white">{user?.name || 'Admin'}</p>
              <p className="text-xs text-blue-200">{user?.role || 'Administrador'}</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className={`flex items-center gap-2 text-sm text-blue-200 hover:text-red-300 px-2 py-1.5 rounded hover:bg-white/10 transition-colors w-full ${collapsed ? 'justify-center' : ''}`}
            title="Sair"
          >
            <FiLogOut className="w-4 h-4" />
            {!collapsed && <span>Sair</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="bg-white border-b border-gray-200 px-4 lg:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-1.5 hover:bg-gray-100 rounded-lg"
            >
              <FiMenu className="w-5 h-5 text-gray-600" />
            </button>
            <Breadcrumbs />
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <FiBell className="w-5 h-5 text-gray-500" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <div className="hidden sm:flex items-center gap-2 text-sm text-gray-600">
              <div className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center text-xs font-bold">
                {(user?.name || 'A')[0]}
              </div>
              <span className="font-medium">{user?.name || 'Admin'}</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
