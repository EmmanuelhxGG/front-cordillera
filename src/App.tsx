import './App.css'
import { useMemo, useState } from 'react'
import { AdminLayout } from './layouts'
import ConfiguracionAuditoriaPage from './pages/ConfiguracionAuditoriaPage'
import DashboardPrincipalPage from './pages/DashboardPrincipalPage'
import GestionOrganizacionalPage from './pages/GestionOrganizacionalPage'
import LoginPage from './pages/LoginPage'
import ReportesPage from './pages/ReportesPage'

type PaginaSistema =
  | 'dashboard'
  | 'reportes'
  | 'gestion-organizacional'
  | 'configuracion-auditoria'

function obtenerSesionInicial() {
  const token = sessionStorage.getItem('token') ?? ''
  const rol = sessionStorage.getItem('rol') ?? ''
  const usuario = sessionStorage.getItem('usuario') ?? ''
  return { token, rol, usuario }
}

function App() {
  const sesionInicial = useMemo(() => obtenerSesionInicial(), [])
  const [token, setToken] = useState(sesionInicial.token)
  const [rol, setRol] = useState(sesionInicial.rol)
  const [usuario, setUsuario] = useState(sesionInicial.usuario)
  const [paginaActual, setPaginaActual] = useState<PaginaSistema>('dashboard')

  function manejarLoginExitoso(
    nuevoToken: string,
    nuevoRol: string,
    nuevoUsuario: string,
  ) {
    setToken(nuevoToken)
    setRol(nuevoRol)
    setUsuario(nuevoUsuario)
    setPaginaActual('dashboard')

    sessionStorage.setItem('token', nuevoToken)
    sessionStorage.setItem('rol', nuevoRol)
    sessionStorage.setItem('usuario', nuevoUsuario)
  }

  function cerrarSesion() {
    sessionStorage.removeItem('token')
    sessionStorage.removeItem('rol')
    sessionStorage.removeItem('usuario')

    setToken('')
    setRol('')
    setUsuario('')
    setPaginaActual('dashboard')
  }

  const esAdmin = rol.toUpperCase() === 'ADMIN'

  if (!token) {
    return (
      <AdminLayout>
        <LoginPage onLoginExitoso={manejarLoginExitoso} />
      </AdminLayout>
    )
  }

  const opcionesMenu: Array<{ clave: PaginaSistema; texto: string }> = [
    { clave: 'dashboard', texto: 'Dashboard principal' },
    { clave: 'reportes', texto: 'Módulo de reportes' },
    ...(esAdmin
      ? ([
          {
            clave: 'gestion-organizacional',
            texto: 'Gestión organizacional',
          },
        ] as Array<{ clave: PaginaSistema; texto: string }>)
      : []),
    {
      clave: 'configuracion-auditoria',
      texto: 'Configuración y auditoría',
    },
  ]

  let contenidoPagina = <DashboardPrincipalPage />

  if (paginaActual === 'reportes') {
    contenidoPagina = <ReportesPage />
  }

  if (paginaActual === 'gestion-organizacional' && esAdmin) {
    contenidoPagina = <GestionOrganizacionalPage />
  }

  if (paginaActual === 'configuracion-auditoria') {
    contenidoPagina = (
      <ConfiguracionAuditoriaPage
        token={token}
        usuario={usuario}
        rol={rol}
        onCerrarSesion={cerrarSesion}
      />
    )
  }

  return (
    <AdminLayout>
      <main className="aplicacion-contenedor">
        <aside className="menu-lateral">
          <h2>Panel Admin</h2>
          <p>{usuario}</p>

          <nav>
            {opcionesMenu.map((opcion) => (
              <button
                key={opcion.clave}
                type="button"
                className={paginaActual === opcion.clave ? 'activo' : ''}
                onClick={() => setPaginaActual(opcion.clave)}
              >
                {opcion.texto}
              </button>
            ))}
          </nav>
        </aside>

        <section className="contenido-principal">{contenidoPagina}</section>
      </main>
    </AdminLayout>
  )
}

export default App
