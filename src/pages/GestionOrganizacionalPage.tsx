import { useEffect, useMemo, useState } from 'react'
import { fetchVentas } from '../api'
import type { Venta } from '../types'

type Sucursal = {
  nombre: string
  metaVenta: number
}

function GestionOrganizacionalPage() {
  const [ventas, setVentas] = useState<Venta[]>([])
  const [sucursales, setSucursales] = useState<Sucursal[]>([])
  const [mensaje, setMensaje] = useState('')

  useEffect(() => {
    async function cargarSucursales() {
      setMensaje('')
      try {
        const listaVentas = await fetchVentas()
        setVentas(listaVentas)
      } catch {
        setMensaje('No se pudo obtener información desde ms-datos.')
      }
    }

    cargarSucursales()
  }, [])

  useEffect(() => {
    if (!ventas.length) return

    const unicas = Array.from(new Set(ventas.map((item) => item.sucursal))).sort()
    setSucursales(
      unicas.map((nombre) => ({
        nombre,
        metaVenta: 1000000,
      })),
    )
  }, [ventas])

  const resumenVentas = useMemo(() => {
    const mapa = new Map<string, number>()

    for (const venta of ventas) {
      mapa.set(venta.sucursal, (mapa.get(venta.sucursal) ?? 0) + venta.montoTotal)
    }

    return mapa
  }, [ventas])

  function actualizarMeta(indice: number, nuevoValor: string) {
    const meta = Number(nuevoValor)
    setSucursales((actual) =>
      actual.map((item, idx) =>
        idx === indice
          ? {
              ...item,
              metaVenta: Number.isNaN(meta) ? 0 : meta,
            }
          : item,
      ),
    )
  }

  function guardarCambios() {
    const existeMetaInvalida = sucursales.some(
      (item) => !item.nombre.trim() || item.metaVenta <= 0,
    )

    if (existeMetaInvalida) {
      setMensaje('Todos los campos deben ser válidos y metas mayores a cero.')
      return
    }

    setMensaje('Cambios validados. (Demo académica sin endpoint PUT de sucursal)')
  }

  return (
    <section className="pagina-contenido">
      <div className="encabezado-pagina">
        <h2>Gestión Organizacional</h2>
        <p>Mantenimiento básico de sucursales y metas</p>
      </div>

      <section className="tarjeta-panel">
        <h3>CRUD de Sucursales (metas)</h3>
        <div className="tabla-simple">
          <div className="fila fila-encabezado">
            <span>Sucursal</span>
            <span>Ventas acumuladas</span>
            <span>Meta de venta</span>
          </div>

          {sucursales.map((sucursal, indice) => (
            <div key={sucursal.nombre} className="fila">
              <span>{sucursal.nombre}</span>
              <span>{resumenVentas.get(sucursal.nombre) ?? 0}</span>
              <span>
                <input
                  type="number"
                  min={1}
                  value={sucursal.metaVenta}
                  onChange={(evento) => actualizarMeta(indice, evento.target.value)}
                />
              </span>
            </div>
          ))}
        </div>

        <button type="button" onClick={guardarCambios}>
          Guardar cambios
        </button>
        {mensaje && <p>{mensaje}</p>}
      </section>
    </section>
  )
}

export default GestionOrganizacionalPage
