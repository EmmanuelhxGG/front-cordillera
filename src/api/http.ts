import axios from 'axios'

export const authHttp = axios.create({
  baseURL: 'http://localhost:8084/api/auth',
  timeout: 8000,
})

export const ventasHttp = axios.create({
  baseURL: 'http://localhost:8081/api/ventas',
  timeout: 8000,
})

export const kpisHttp = axios.create({
  baseURL: 'http://localhost:8082/api/kpis',
  timeout: 8000,
})

export const reportesHttp = axios.create({
  baseURL: 'http://localhost:8083/api/reportes',
  timeout: 8000,
})
