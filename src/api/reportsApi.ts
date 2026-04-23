import { reportesHttp } from './http'

export type PlantillaReporteInput = {
  titulo: string
  configuracionVisual: string
  estado: string
}

export async function createPlantillaReporte(payload: PlantillaReporteInput) {
  const { data } = await reportesHttp.post('/plantillas', payload)
  return data
}

export async function eliminarPlantillaReporte(id: number) {
  await reportesHttp.delete(`/plantillas/${id}`)
}
