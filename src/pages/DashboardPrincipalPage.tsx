import { useEffect, useMemo, useState } from 'react'
import { fetchDashboard } from '../api'
import type { DashboardResponse, Kpi, Venta } from '../types'
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
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

const FORMATO_COMPACTO = new Intl.NumberFormat('es-CL', {
  notation: 'compact',
  maximumFractionDigits: 1,
})

const COLORES_GRAFICO = [
  '#0f766e',
  '#1d4ed8',
  '#0891b2',
  '#4f46e5',
  '#65a30d',
  '#b45309',
  '#9333ea',
  '#dc2626',
]

const TARJETAS_POR_PAGINA = 4

const SUCURSALES_DEMO = [
  { sucursal: 'Santiago', base: 20000000 },
  { sucursal: 'Concepción', base: 12000000 },
  { sucursal: 'Valparaíso', base: 13800000 },
  { sucursal: 'Temuco', base: 9800000 },
  { sucursal: 'Antofagasta', base: 11400000 },
  { sucursal: 'La Serena', base: 9200000 },
  { sucursal: 'Rancagua', base: 8700000 },
  { sucursal: 'Talca', base: 8400000 },
  { sucursal: 'Puerto Montt', base: 9100000 },
  { sucursal: 'Osorno', base: 7600000 },
  { sucursal: 'Iquique', base: 7300000 },
  { sucursal: 'Arica', base: 6900000 },
  { sucursal: 'Copiapó', base: 7100000 },
  { sucursal: 'Curicó', base: 6800000 },
  { sucursal: 'Chillán', base: 7900000 },
  { sucursal: 'Los Ángeles', base: 8100000 },
  { sucursal: 'Punta Arenas', base: 7400000 },
  { sucursal: 'Coyhaique', base: 5900000 },
  { sucursal: 'Calama', base: 8300000 },
  { sucursal: 'San Antonio', base: 6600000 },
  { sucursal: 'Quillota', base: 6200000 },
  { sucursal: 'San Felipe', base: 6050000 },
  { sucursal: 'Melipilla', base: 6400000 },
  { sucursal: 'Maipú', base: 9500000 },
  { sucursal: 'Puente Alto', base: 9700000 },
  { sucursal: 'Las Condes', base: 11800000 },
  { sucursal: 'Ñuñoa', base: 10200000 },
  { sucursal: 'Providencia', base: 11000000 },
  { sucursal: 'Viña del Mar', base: 11500000 },
  { sucursal: 'Quilpué', base: 6300000 },
  { sucursal: 'Linares', base: 6000000 },
  { sucursal: 'Ovalle', base: 5750000 },
]

function generarVentasDemo(): Venta[] {
  const factoresMensualesBase = [0.74, 0.82, 0.79, 0.9, 0.87, 1]
  const meses = [
    '2025-11-15T12:00:00',
    '2025-12-15T12:00:00',
    '2026-01-15T12:00:00',
    '2026-02-15T12:00:00',
    '2026-03-15T12:00:00',
    '2026-04-15T12:00:00',
  ]
  let id = 1

  return meses.flatMap((fechaVenta, indiceMes) =>
    SUCURSALES_DEMO.map(({ sucursal, base }, indiceSucursal) => {
      const desplazamientoSucursal = ((indiceSucursal % 7) - 3) * 0.03
      const variacionOndulada =
        Math.sin((indiceSucursal + 2) * (indiceMes + 1) * 0.65) * 0.05
      const ajusteCiclico = ((indiceSucursal + indiceMes) % 4 === 0 ? 0.05 : -0.02)
      const factor = Math.max(
        0.58,
        factoresMensualesBase[indiceMes] +
          desplazamientoSucursal +
          variacionOndulada +
          ajusteCiclico,
      )

      return {
        id: id++,
        fechaVenta,
        montoTotal: Math.round(base * factor + indiceSucursal * 28000),
        sistemaOrigen: indiceSucursal % 2 === 0 ? 'POS' : 'Ecommerce',
        sucursal,
      }
    }),
  )
}

const VENTAS_DEMO: Venta[] = generarVentasDemo()

const TOTAL_DEMO = VENTAS_DEMO.reduce((acum, item) => acum + item.montoTotal, 0)

const KPIS_DEMO: Kpi[] = [
  {
    id: 1,
    nombre: 'Ventas Totales',
    formula: 'SUM(montoTotal)',
    valorCalculado: TOTAL_DEMO,
    fechaActualizacion: '2026-04-23T12:00:00',
  },
  {
    id: 2,
    nombre: 'Ticket Promedio',
    formula: 'SUM(montoTotal)/COUNT(*)',
    valorCalculado: TOTAL_DEMO / VENTAS_DEMO.length,
    fechaActualizacion: '2026-04-23T12:00:00',
  },
]

const DASHBOARD_DEMO: DashboardResponse = {
  resumen: {
    totalVentas: TOTAL_DEMO,
    cantidadVentas: VENTAS_DEMO.length,
    cantidadSucursales: SUCURSALES_DEMO.length,
  },
  ventas: VENTAS_DEMO,
  ventasPorSucursal: [],
  kpis: KPIS_DEMO,
  alertas: ['Modo demo activo.'],
}

function DashboardPrincipalPage() {
  const [ventas, setVentas] = useState<Venta[]>(DASHBOARD_DEMO.ventas)
  const [kpis, setKpis] = useState<Kpi[]>(DASHBOARD_DEMO.kpis)
  const [alertas, setAlertas] = useState<string[]>(DASHBOARD_DEMO.alertas)
  const [cargando, setCargando] = useState(false)
  const [mensajeError, setMensajeError] = useState('')
  const [paginaSucursales, setPaginaSucursales] = useState(0)
  const [sucursalActiva, setSucursalActiva] = useState<string | null>(null)

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

  const ventasPorSucursal = useMemo(() => {
    const porSucursal = new Map<string, number>()

    for (const venta of ventas) {
      porSucursal.set(
        venta.sucursal,
        (porSucursal.get(venta.sucursal) ?? 0) + venta.montoTotal,
      )
    }

    return Array.from(porSucursal.entries())
      .map(([sucursal, total]) => ({ sucursal, total }))
      .sort((a, b) => b.total - a.total)
  }, [ventas])

  const ventasTotales = useMemo(
    () => ventas.reduce((acum, item) => acum + item.montoTotal, 0),
    [ventas],
  )

  const graficoConsolidado = useMemo(() => {
    const porMes = new Map<string, number>()

    for (const venta of ventas) {
      const fecha = new Date(venta.fechaVenta)
      if (Number.isNaN(fecha.getTime())) continue

      const llave = `${fecha.getFullYear()}-${`${fecha.getMonth() + 1}`.padStart(2, '0')}`
      porMes.set(llave, (porMes.get(llave) ?? 0) + venta.montoTotal)
    }

    return Array.from(porMes.entries())
      .map(([periodo, total]) => ({ periodo, total }))
      .sort((a, b) => (a.periodo > b.periodo ? 1 : -1))
  }, [ventas])

  const serieSucursalActiva = useMemo(() => {
    if (!sucursalActiva) return []

    const porMes = new Map<string, number>()
    for (const venta of ventas) {
      if (venta.sucursal !== sucursalActiva) continue

      const fecha = new Date(venta.fechaVenta)
      if (Number.isNaN(fecha.getTime())) continue

      const periodo = `${fecha.getFullYear()}-${`${fecha.getMonth() + 1}`.padStart(2, '0')}`
      porMes.set(periodo, (porMes.get(periodo) ?? 0) + venta.montoTotal)
    }

    return Array.from(porMes.entries())
      .map(([periodo, total]) => ({ periodo, total }))
      .sort((a, b) => (a.periodo > b.periodo ? 1 : -1))
      .slice(-6)
  }, [sucursalActiva, ventas])

  const resumenSucursalActiva = useMemo(() => {
    if (!sucursalActiva) return null

    const total = serieSucursalActiva.reduce((acum, item) => acum + item.total, 0)
    const promedioMensual = serieSucursalActiva.length
      ? total / serieSucursalActiva.length
      : 0
    const mejorMes = serieSucursalActiva.reduce<{ periodo: string; total: number } | null>(
      (maximo, actual) =>
        !maximo || actual.total > maximo.total ? actual : maximo,
      null,
    )
    const registros = ventas.filter((item) => item.sucursal === sucursalActiva).length

    return {
      total,
      promedioMensual,
      mejorMes,
      registros,
    }
  }, [serieSucursalActiva, sucursalActiva, ventas])

  const rendimientoSucursales = useMemo(() => {
    if (!ventasTotales) return []

    return ventasPorSucursal.map((item) => ({
      ...item,
      porcentaje: (item.total / ventasTotales) * 100,
    }))
  }, [ventasPorSucursal, ventasTotales])

  const tarjetasSucursales = useMemo(() => {
    const mapaSeries = new Map<string, Map<string, number>>()

    for (const venta of ventas) {
      const sucursal = venta.sucursal
      const fecha = new Date(venta.fechaVenta)
      if (Number.isNaN(fecha.getTime())) continue

      const periodo = `${fecha.getFullYear()}-${`${fecha.getMonth() + 1}`.padStart(2, '0')}`
      const serie = mapaSeries.get(sucursal) ?? new Map<string, number>()
      serie.set(periodo, (serie.get(periodo) ?? 0) + venta.montoTotal)
      mapaSeries.set(sucursal, serie)
    }

    return ventasPorSucursal.map((item) => ({
      sucursal: item.sucursal,
      total: item.total,
      serie: Array.from(mapaSeries.get(item.sucursal)?.entries() ?? [])
        .map(([periodo, total]) => ({ periodo, total }))
        .sort((a, b) => (a.periodo > b.periodo ? 1 : -1)),
    }))
  }, [ventas, ventasPorSucursal])

  const totalPaginasSucursales = Math.max(
    1,
    Math.ceil(tarjetasSucursales.length / TARJETAS_POR_PAGINA),
  )

  useEffect(() => {
    if (paginaSucursales > totalPaginasSucursales - 1) {
      setPaginaSucursales(0)
    }
  }, [paginaSucursales, totalPaginasSucursales])

  const inicioPagina = paginaSucursales * TARJETAS_POR_PAGINA
  const tarjetasVisibles = tarjetasSucursales.slice(
    inicioPagina,
    inicioPagina + TARJETAS_POR_PAGINA,
  )

  function paginaAnteriorSucursales() {
    setPaginaSucursales((actual) =>
      actual === 0 ? totalPaginasSucursales - 1 : actual - 1,
    )
  }

  function paginaSiguienteSucursales() {
    setPaginaSucursales((actual) =>
      actual === totalPaginasSucursales - 1 ? 0 : actual + 1,
    )
  }

  return (
    <section className="pagina-contenido">
      <div className="encabezado-pagina">
        <h2>Dashboard Principal</h2>
        <p>Ventas por sucursal, consolidado global y rendimiento comercial</p>
      </div>

      {cargando && <p>Cargando información...</p>}
      {mensajeError && <p className="mensaje-error">{mensajeError}</p>}
      {!mensajeError && alertas.length > 0 && <p className="mensaje-demo">{alertas[0]}</p>}

      <section className="tarjeta-panel">
        <div className="encabezado-mini-sucursales">
          <h3>Ventas por sucursal</h3>
          <div className="controles-mini-sucursales">
            <button type="button" onClick={paginaAnteriorSucursales} aria-label="Página anterior">
              ◀
            </button>
            <span>
              {Math.min(paginaSucursales + 1, totalPaginasSucursales)} / {totalPaginasSucursales}
            </span>
            <button type="button" onClick={paginaSiguienteSucursales} aria-label="Página siguiente">
              ▶
            </button>
          </div>
        </div>

        <p className="mensaje-demo">
          Ejemplo: Santiago {FORMATO_MONEDA.format(20000000)} y Concepción{' '}
          {FORMATO_MONEDA.format(12000000)}.
        </p>

        <div className="rejilla-mini-sucursales">
          {tarjetasVisibles.map((item, index) => {
            const miniId = `mini-${inicioPagina + index}`
            return (
            <article className="tarjeta-mini-sucursal" key={item.sucursal}>
              <button
                type="button"
                className="boton-mini-sucursal"
                onClick={() => setSucursalActiva(item.sucursal)}
              >
              <h4>{item.sucursal}</h4>
              <p>{FORMATO_MONEDA.format(item.total)}</p>
              <div className="mini-grafico-sucursal">
                <ResponsiveContainer width="100%" height={90}>
                  <AreaChart data={item.serie}>
                    <defs>
                      <linearGradient id={miniId} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0f766e" stopOpacity={0.32} />
                        <stop offset="95%" stopColor="#0f766e" stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="periodo" hide />
                    <YAxis hide />
                    <Tooltip formatter={(valor) => FORMATO_MONEDA.format(Number(valor))} />
                    <Area
                      type="monotone"
                      dataKey="total"
                      stroke="#0f766e"
                      strokeWidth={2}
                      dot={{ r: 2.5, fill: '#ffffff', stroke: '#0f766e', strokeWidth: 1.5 }}
                      activeDot={{ r: 4 }}
                      fillOpacity={1}
                      fill={`url(#${miniId})`}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              </button>
            </article>
          )})}
        </div>
      </section>

      {sucursalActiva ? (
        <>
          <section className="tarjeta-panel">
            <div className="encabezado-mini-sucursales">
              <h3>Rendimiento de {sucursalActiva} (últimos 6 meses)</h3>
              <button
                type="button"
                className="boton-volver-general"
                onClick={() => setSucursalActiva(null)}
              >
                Volver al general
              </button>
            </div>

            <div className="contenedor-grafico">
              <ResponsiveContainer width="100%" height={320}>
                <AreaChart
                  data={serieSucursalActiva}
                  margin={{ top: 8, right: 18, left: 8, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorSucursalDetalle" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0f766e" stopOpacity={0.38} />
                      <stop offset="95%" stopColor="#0f766e" stopOpacity={0.06} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="periodo" />
                  <YAxis
                    width={70}
                    tickFormatter={(valor) => FORMATO_COMPACTO.format(Number(valor))}
                  />
                  <Tooltip formatter={(valor) => FORMATO_MONEDA.format(Number(valor))} />
                  <Area
                    type="monotone"
                    dataKey="total"
                    stroke="#0f766e"
                    dot={{ r: 3, fill: '#ffffff', stroke: '#0f766e', strokeWidth: 1.5 }}
                    activeDot={{ r: 5 }}
                    fillOpacity={1}
                    fill="url(#colorSucursalDetalle)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="tarjeta-panel">
            <h3>Resumen rápido ({sucursalActiva})</h3>
            <div className="rejilla-kpi">
              <article className="tarjeta-kpi">
                <h3>Ventas 6 meses</h3>
                <p>{FORMATO_MONEDA.format(resumenSucursalActiva?.total ?? 0)}</p>
              </article>

              <article className="tarjeta-kpi">
                <h3>Promedio mensual</h3>
                <p>{FORMATO_MONEDA.format(resumenSucursalActiva?.promedioMensual ?? 0)}</p>
              </article>

              <article className="tarjeta-kpi">
                <h3>Mejor mes</h3>
                <p>{resumenSucursalActiva?.mejorMes?.periodo ?? '-'}</p>
              </article>

              <article className="tarjeta-kpi">
                <h3>Registros de venta</h3>
                <p>{resumenSucursalActiva?.registros ?? 0}</p>
              </article>
            </div>
          </section>
        </>
      ) : (
        <section className="panel-graficos">
        <article className="tarjeta-panel grafico-principal">
          <h3>Venta consolidada (todas las sucursales)</h3>
          <div className="contenedor-grafico">
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart
                data={graficoConsolidado}
                margin={{ top: 8, right: 18, left: 8, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.34} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="periodo" />
                <YAxis
                  width={70}
                  tickFormatter={(valor) => FORMATO_COMPACTO.format(Number(valor))}
                />
                <Tooltip formatter={(valor) => FORMATO_MONEDA.format(Number(valor))} />
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke="#2563eb"
                  fillOpacity={1}
                  fill="url(#colorVentas)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <p className="mensaje-demo">Total consolidado: {FORMATO_MONEDA.format(ventasTotales)}</p>
        </article>

        <article className="tarjeta-panel grafico-rendimiento">
          <h3>Rendimiento por sucursal</h3>
          <div className="contenedor-grafico">
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie
                  data={rendimientoSucursales}
                  dataKey="porcentaje"
                  nameKey="sucursal"
                  innerRadius={60}
                  outerRadius={110}
                  paddingAngle={1}
                >
                  {rendimientoSucursales.map((item, index) => (
                    <Cell
                      key={item.sucursal}
                      fill={COLORES_GRAFICO[index % COLORES_GRAFICO.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(valor, _, item) => {
                    const total = item?.payload?.total ?? 0
                    return [
                      `${Number(valor).toFixed(2)}% • ${FORMATO_MONEDA.format(total)}`,
                      'Participación',
                    ]
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="lista-sucursales-resumen">
            {rendimientoSucursales.slice(0, 8).map((item) => (
              <p key={item.sucursal}>
                <strong>{item.sucursal}:</strong> {item.porcentaje.toFixed(1)}%
              </p>
            ))}
          </div>
        </article>
      </section>
      )}

      {!sucursalActiva && <section className="tarjeta-panel">
        <h3>Resumen rápido</h3>
        <div className="rejilla-kpi">
          <article className="tarjeta-kpi">
            <h3>Ventas Totales</h3>
            <p>{FORMATO_MONEDA.format(ventasTotales)}</p>
          </article>

          <article className="tarjeta-kpi">
            <h3>Ventas registradas</h3>
            <p>{ventas.length}</p>
          </article>

          <article className="tarjeta-kpi">
            <h3>Sucursales activas</h3>
            <p>{ventasPorSucursal.length}</p>
          </article>

          <article className="tarjeta-kpi">
            <h3>KPIs disponibles</h3>
            <p>{kpis.length}</p>
          </article>
        </div>
      </section>}
    </section>
  )
}

export default DashboardPrincipalPage
