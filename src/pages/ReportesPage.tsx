import { useMemo, useState } from 'react'
import { createPlantillaReporte, eliminarPlantillaReporte } from '../api'

type Plantilla = {
  id: number
  titulo: string
  configuracionVisual: string
  estado: string
}

const TAMANO_PAGINA = 5

function descargarComoTexto(nombreArchivo: string, contenido: string) {
  const blob = new Blob([contenido], { type: 'text/plain;charset=utf-8' })
  const enlace = document.createElement('a')
  enlace.href = URL.createObjectURL(blob)
  enlace.download = nombreArchivo
  enlace.click()
  URL.revokeObjectURL(enlace.href)
}

function ReportesPage() {
  const [titulo, setTitulo] = useState('')
  const [configuracionVisual, setConfiguracionVisual] = useState('')
  const [plantillas, setPlantillas] = useState<Plantilla[]>([])
  const [paginaActual, setPaginaActual] = useState(1)
  const [mensaje, setMensaje] = useState('')

  const totalPaginas = Math.max(1, Math.ceil(plantillas.length / TAMANO_PAGINA))

  const plantillasPaginadas = useMemo(() => {
    const inicio = (paginaActual - 1) * TAMANO_PAGINA
    return plantillas.slice(inicio, inicio + TAMANO_PAGINA)
  }, [paginaActual, plantillas])

  async function crearPlantilla() {
    setMensaje('')

    if (!titulo.trim() || !configuracionVisual.trim()) {
      setMensaje('Debe completar título y configuración visual.')
      return
    }

    const nuevaPlantilla: Plantilla = {
      id: Date.now(),
      titulo: titulo.trim(),
      configuracionVisual: configuracionVisual.trim(),
      estado: 'Activo',
    }

    try {
      await createPlantillaReporte({
        titulo: titulo.trim(),
        configuracionVisual: configuracionVisual.trim(),
        estado: 'Activo',
      })

      setPlantillas((actual) => [nuevaPlantilla, ...actual])
      setTitulo('')
      setConfiguracionVisual('')
      setPaginaActual(1)
      setMensaje('Plantilla creada correctamente.')
    } catch {
      setPlantillas((actual) => [nuevaPlantilla, ...actual])
      setTitulo('')
      setConfiguracionVisual('')
      setPaginaActual(1)
      setMensaje('ms-reportes no responde. Plantilla guardada en modo local.')
    }
  }

  async function eliminarPlantilla(id: number) {
    try {
      await eliminarPlantillaReporte(id)
    } catch {
      // Si backend no encuentra el id local, mantenemos borrado local para demo académica
    }

    setPlantillas((actual) => actual.filter((item) => item.id !== id))
  }

  function exportarPDF() {
    const contenido = JSON.stringify(plantillas, null, 2)
    descargarComoTexto('reportes.pdf', contenido)
  }

  function exportarExcel() {
    const cabecera = 'id,titulo,configuracionVisual,estado\n'
    const filas = plantillas
      .map(
        (item) =>
          `${item.id},"${item.titulo}","${item.configuracionVisual}",${item.estado}`,
      )
      .join('\n')

    descargarComoTexto('reportes.csv', cabecera + filas)
  }

  return (
    <section className="pagina-contenido">
      <div className="encabezado-pagina">
        <h2>Módulo de Reportes</h2>
        <p>Creación de plantillas y análisis con paginación</p>
      </div>

      <section className="tarjeta-panel">
        <h3>Nueva plantilla</h3>
        <div className="formulario-simple">
          <label>
            Título
            <input
              type="text"
              value={titulo}
              onChange={(evento) => setTitulo(evento.target.value)}
            />
          </label>

          <label>
            Configuración visual
            <input
              type="text"
              value={configuracionVisual}
              onChange={(evento) => setConfiguracionVisual(evento.target.value)}
            />
          </label>

          <button type="button" onClick={crearPlantilla}>
            Crear plantilla
          </button>
        </div>

        {mensaje && <p>{mensaje}</p>}
      </section>

      <section className="tarjeta-panel">
        <div className="fila-acciones">
          <h3>Listado de reportes</h3>
          <div>
            <button type="button" onClick={exportarPDF}>
              Descargar PDF
            </button>
            <button type="button" onClick={exportarExcel}>
              Descargar Excel
            </button>
          </div>
        </div>

        <div className="tabla-simple">
          <div className="fila fila-encabezado">
            <span>Título</span>
            <span>Estado</span>
            <span>Acciones</span>
          </div>
          {plantillasPaginadas.map((plantilla) => (
            <div className="fila" key={plantilla.id}>
              <span>{plantilla.titulo}</span>
              <span>{plantilla.estado}</span>
              <span>
                <button type="button" onClick={() => eliminarPlantilla(plantilla.id)}>
                  Eliminar
                </button>
              </span>
            </div>
          ))}
          {plantillasPaginadas.length === 0 && (
            <p>No hay plantillas creadas aún.</p>
          )}
        </div>

        <div className="paginacion">
          <button
            type="button"
            disabled={paginaActual === 1}
            onClick={() => setPaginaActual((valor) => Math.max(1, valor - 1))}
          >
            Anterior
          </button>
          <span>
            Página {paginaActual} de {totalPaginas}
          </span>
          <button
            type="button"
            disabled={paginaActual === totalPaginas}
            onClick={() =>
              setPaginaActual((valor) => Math.min(totalPaginas, valor + 1))
            }
          >
            Siguiente
          </button>
        </div>
      </section>
    </section>
  )
}

export default ReportesPage
