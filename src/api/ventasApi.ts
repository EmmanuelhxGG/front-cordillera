import { ventasHttp } from './http'
import type { Venta } from '../types'

export async function fetchVentas(): Promise<Venta[]> {
  const { data } = await ventasHttp.get<Venta[]>('')
  return Array.isArray(data) ? data : []
}
