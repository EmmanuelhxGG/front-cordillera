import { kpisHttp } from './http'
import type { Kpi } from '../types'

export async function fetchKpis(): Promise<Kpi[]> {
  const { data } = await kpisHttp.get<Kpi[]>('')
  return Array.isArray(data) ? data : []
}
