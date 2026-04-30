import { Link, useLocation } from 'react-router-dom'
import { FiChevronRight, FiHome } from 'react-icons/fi'

const routeNames: Record<string, string> = {
  dashboard: 'Dashboard',
  projects: 'Obras',
  machines: 'Máquinas',
  employees: 'Colaboradores',
  production: 'Apontamentos',
  fueling: 'Combustível',
  maintenance: 'Manutenção',
  financial: 'Financeiro',
  reports: 'Relatórios',
}

export default function Breadcrumbs() {
  const location = useLocation()
  const paths = location.pathname.split('/').filter(Boolean)

  return (
    <nav className="flex items-center gap-1 text-sm text-gray-500">
      <Link to="/dashboard" className="hover:text-primary-600 transition-colors">
        <FiHome className="w-4 h-4" />
      </Link>
      {paths.map((segment, i) => {
        const path = '/' + paths.slice(0, i + 1).join('/')
        const name = routeNames[segment] || segment
        const isLast = i === paths.length - 1

        return (
          <span key={path} className="flex items-center gap-1">
            <FiChevronRight className="w-3 h-3" />
            {isLast ? (
              <span className="text-gray-900 font-medium">{name}</span>
            ) : (
              <Link to={path} className="hover:text-primary-600 transition-colors">{name}</Link>
            )}
          </span>
        )
      })}
    </nav>
  )
}
