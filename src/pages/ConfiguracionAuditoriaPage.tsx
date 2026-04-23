import { useEffect, useState } from 'react'
import { fetchKpis, fetchVentas, validateToken } from '../api'

type EstadoServicio = {
  nombre: string
  estado: 'conectado' | 'sin-conexion'
}

type ConfiguracionAuditoriaPageProps = {
  token: string
  usuario: string
  rol: string
  onCerrarSesion: () => void
}

function ConfiguracionAuditoriaPage({
  token,
  usuario,
  rol,
  onCerrarSesion,
}: ConfiguracionAuditoriaPageProps) {
  const [estadoServicios, setEstadoServicios] = useState<EstadoServicio[]>([
    { nombre: 'ms-auth', estado: 'sin-conexion' },
    { nombre: 'ms-datos', estado: 'sin-conexion' },
    { nombre: 'ms-kpis', estado: 'sin-conexion' },
  ])

  useEffect(() => {
    async function validarServicios() {
      const resultados = await Promise.allSettled([
        validateToken(token),
        fetchVentas(),
        fetchKpis(),
      ])

      setEstadoServicios([
        {
          nombre: 'ms-auth',
          estado: resultados[0].status === 'fulfilled' ? 'conectado' : 'sin-conexion',
        },
        {
          nombre: 'ms-datos',
          estado: resultados[1].status === 'fulfilled' ? 'conectado' : 'sin-conexion',
        },
        {
          nombre: 'ms-kpis',
          estado: resultados[2].status === 'fulfilled' ? 'conectado' : 'sin-conexion',
        },
      ])
    }

    validarServicios()
  }, [token])

  return (
    <section className="pagina-contenido">
      <div className="encabezado-pagina">
        <h2>Configuración y Auditoría</h2>
        <p>Control de sesión y estado de integración backend</p>
      </div>

      <section className="tarjeta-panel">
        <h3>Perfil de usuario</h3>
        <p>Usuario: {usuario}</p>
        <p>Rol: {rol}</p>
        <p>Token activo: {token ? 'Sí' : 'No'}</p>
        <button type="button" onClick={onCerrarSesion}>
          Cerrar sesión
        </button>
      </section>

      <section className="tarjeta-panel">
        <h3>Health Check de servicios</h3>
        <ul className="lista-servicios">
          {estadoServicios.map((servicio) => (
            <li key={servicio.nombre}>
              <span
                className={`estado-circulo ${
                  servicio.estado === 'conectado' ? 'ok' : 'error'
                }`}
              />
              {servicio.nombre} - {servicio.estado}
            </li>
          ))}
        </ul>
      </section>
    </section>
  )
}

export default ConfiguracionAuditoriaPage
