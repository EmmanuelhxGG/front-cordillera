import { useEffect, useMemo, useState } from 'react'
import { fetchDashboard } from '../api'
import type { DashboardResponse, Kpi, Venta } from '../types'
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

const FORMATO_MONEDA = new Intl.NumberFormat('es-CL', {
  style: 'currency',
  currency: 'CLP',
  maximumFractionDigits: 0,
})

type DashboardPrincipalPageProps = {
  ciudadSeleccionada: string
  onCambiarCiudad: (ciudad: string) => void
}

const VENTAS_DEMO: Venta[] = [
  {
    id: 1,
    fechaVenta: '2026-04-10T10:00:00',
    montoTotal: 1500000,
    sistemaOrigen: 'POS',
    sucursal: 'Santiago',
  },
  {
    id: 2,
    fechaVenta: '2026-04-11T14:20:00',
    montoTotal: 980000,
    sistemaOrigen: 'POS',
    sucursal: 'Valparaiso',
  },
  {
    id: 3,
    fechaVenta: '2026-04-12T09:40:00',
    montoTotal: 1230000,
    sistemaOrigen: 'POS',
    sucursal: 'Concepcion',
  },
]

const KPIS_DEMO: Kpi[] = [
  {
    id: 1,
    nombre: 'Ventas Totales',
    formula: 'SUM(montoTotal)',
    valorCalculado: 3710000,
    fechaActualizacion: '2026-04-12T12:00:00',
  },
  {
    id: 2,
    nombre: 'Ticket Promedio',
    formula: 'SUM(montoTotal)/COUNT(*)',
    valorCalculado: 1236666,
    fechaActualizacion: '2026-04-12T12:00:00',
  },
]

const DASHBOARD_DEMO: DashboardResponse = {
  resumen: {
    totalVentas: 3710000,
    cantidadVentas: 3,
    cantidadSucursales: 3,
  },
  ventas: VENTAS_DEMO,
  ventasPorSucursal: VENTAS_DEMO.map((venta) => ({
    sucursal: venta.sucursal,
    total: venta.montoTotal,
  })),
  kpis: KPIS_DEMO,
  alertas: ['Modo demo activo.'],
}

function DashboardPrincipalPage({
  ciudadSeleccionada,
  onCambiarCiudad,
}: DashboardPrincipalPageProps) {
  const [ventas, setVentas] = useState<Venta[]>(DASHBOARD_DEMO.ventas)
  const [kpis, setKpis] = useState<Kpi[]>(DASHBOARD_DEMO.kpis)
  const [alertas, setAlertas] = useState<string[]>(DASHBOARD_DEMO.alertas)
  const [cargando, setCargando] = useState(false)
  const [mensajeError, setMensajeError] = useState('')

  useEffect(() => {
    async function cargarDatos() {
      setCargando(true)
      setMensajeError('')

      try {
        const respuesta = await fetchDashboard()
        setVentas(respuesta.ventas)
        setKpis(respuesta.kpis)
        setAlertas(respuesta.alertas)
      } catch {
        setVentas(DASHBOARD_DEMO.ventas)
        setKpis(DASHBOARD_DEMO.kpis)
        setAlertas(DASHBOARD_DEMO.alertas)
        setMensajeError('No se pudo conectar con backend. Mostrando datos demo.')
      } finally {
        setCargando(false)
      }
    }

    cargarDatos()
  }, [])

  const ciudadesDisponibles = useMemo(() => {
    const ciudades = new Set(ventas.map((item) => item.sucursal))
    return ['Todas', ...Array.from(ciudades).sort()]
  }, [ventas])

  const ventasFiltradas = useMemo(() => {
    if (ciudadSeleccionada === 'Todas') return ventas
    return ventas.filter((venta) => venta.sucursal === ciudadSeleccionada)
  }, [ciudadSeleccionada, ventas])

  const ventasTotales = useMemo(
    () => ventasFiltradas.reduce((acum, item) => acum + item.montoTotal, 0),
    [ventasFiltradas],
  )

  const datosGrafico = useMemo(() => {
    const porSucursal = new Map<string, number>()

    for (const venta of ventasFiltradas) {
      porSucursal.set(
        venta.sucursal,
        (porSucursal.get(venta.sucursal) ?? 0) + venta.montoTotal,
      )
    }

    return Array.from(porSucursal.entries()).map(([sucursal, total]) => ({
      sucursal,
      total,
    }))
  }, [ventasFiltradas])

  const kpiVentas = FORMATO_MONEDA.format(ventasTotales)
  const kpiStock = `${ventasFiltradas.length * 3} unidades` // Valor referencial académico
  const kpiSatisfaccion = `${Math.min(98, 70 + ventasFiltradas.length)}%` // Valor referencial académico

  return (
    <section className="pagina-contenido">
      <div className="encabezado-pagina">
        <h2>Dashboard Principal</h2>
        <p>Monitoreo general del desempeño organizacional</p>
      </div>

      <div className="filtro-simple">
        <label>
          Ciudad
          <select
            value={ciudadSeleccionada}
            onChange={(evento) => onCambiarCiudad(evento.target.value)}
          >
            {ciudadesDisponibles.map((ciudad) => (
              <option key={ciudad} value={ciudad}>
                {ciudad}
              </option>
            ))}
          </select>
        </label>
      </div>

      {cargando && <p>Cargando información...</p>}
      {mensajeError && <p className="mensaje-error">{mensajeError}</p>}
      {!mensajeError && alertas.length > 0 && (
        <p className="mensaje-demo">{alertas[0]}</p>
      )}

      <div className="rejilla-kpi">
        <article className="tarjeta-kpi">
          <h3>Ventas Totales (POS)</h3>
          <p>{kpiVentas}</p>
        </article>

        <article className="tarjeta-kpi">
          <h3>Nivel de Stock</h3>
          <p>{kpiStock}</p>
        </article>

        <article className="tarjeta-kpi">
          <h3>Satisfacción Cliente</h3>
          <p>{kpiSatisfaccion}</p>
        </article>

        <article className="tarjeta-kpi">
          <h3>KPIs disponibles</h3>
          <p>{kpis.length}</p>
        </article>
      </div>

      <section className="tarjeta-panel">
        <h3>Comparación entre sucursales</h3>
        <div className="contenedor-grafico">
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={datosGrafico}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="sucursal" />
              <YAxis />
              <Tooltip formatter={(valor) => FORMATO_MONEDA.format(Number(valor))} />
              <Legend />
              <Line type="monotone" dataKey="total" stroke="#2f6fb1" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>
    </section>
  )
}

export default DashboardPrincipalPage
