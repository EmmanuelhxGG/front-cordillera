import { authHttp } from './http'

type CredencialesLogin = {
  username: string
  password: string
}

export async function iniciarSesion(
  credenciales: CredencialesLogin,
): Promise<string> {
  const { data } = await authHttp.post<string>('/login', credenciales)
  return data
}

export async function validateToken(token: string): Promise<string> {
  const { data } = await authHttp.get<string>('/validar', {
    headers: {
      Authorization: token,
    },
  })
  return data
}
