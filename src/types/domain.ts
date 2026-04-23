export type Venta = {
  id: number
  fechaVenta: string
  montoTotal: number
  sistemaOrigen: string
  sucursal: string
}

export type Kpi = {
  id: number
  nombre: string
  formula: string
  valorCalculado: number
  fechaActualizacion: string
}

export type BranchSummary = {
  sucursal: string
  total: number
}

export type BranchCatalogItem = {
  sucursal: string
  zona: string
  total: number
}

export type AlertLevel = 'alta' | 'media' | 'info'

export type DashboardAlert = {
  title: string
  message: string
  level: AlertLevel
}
