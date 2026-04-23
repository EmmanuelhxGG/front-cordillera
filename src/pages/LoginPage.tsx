import { useState } from 'react'
import type { FormEvent } from 'react'
import { iniciarSesion } from '../api'
import type { LoginResponse } from '../types'

type LoginPageProps = {
  onLoginExitoso: (token: string, rol: string, usuario: string) => void
}

function LoginPage({ onLoginExitoso }: LoginPageProps) {
  const [usuario, setUsuario] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [cargando, setCargando] = useState(false)
  const [mensajeError, setMensajeError] = useState('')

  function entrarComoInvitado() {
    onLoginExitoso('demo-token', 'EJECUTIVO', 'Invitado')
  }

  async function manejarSubmit(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    setMensajeError('')

    if (!usuario.trim() && !contrasena.trim()) {
      entrarComoInvitado()
      return
    }

    if (!usuario.trim() || !contrasena.trim()) {
      setMensajeError('Debe ingresar usuario y contraseña, o dejar ambos vacíos para modo demo.')
      return
    }

    setCargando(true)

    try {
      const respuesta: LoginResponse = await iniciarSesion({
        username: usuario.trim(),
        password: contrasena,
      })

      onLoginExitoso(respuesta.token, respuesta.rol, respuesta.usuario)
    } catch (error) {
      const mensajeGenerico =
        'No se pudo iniciar sesión. Verifique credenciales o conexión con ms-auth.'

      if (typeof error === 'object' && error !== null && 'message' in error) {
        setMensajeError(String(error.message) || mensajeGenerico)
      } else {
        setMensajeError(mensajeGenerico)
      }
    } finally {
      setCargando(false)
    }
  }

  return (
    <main className="pagina-login">
      <section className="tarjeta-login">
        <h1>Plataforma Grupo Cordillera</h1>
        <p>Acceso para ejecutivos y administradores</p>

        <form onSubmit={manejarSubmit} className="formulario-login">
          <label>
            Usuario
            <input
              type="text"
              value={usuario}
              onChange={(evento) => setUsuario(evento.target.value)}
              placeholder="Ej: admin.cordillera"
            />
          </label>

          <label>
            Contraseña
            <input
              type="password"
              value={contrasena}
              onChange={(evento) => setContrasena(evento.target.value)}
              placeholder="Ingrese su contraseña"
            />
          </label>

          <button type="submit" disabled={cargando}>
            {cargando ? 'Ingresando...' : 'Iniciar sesión'}
          </button>

          <button type="button" onClick={entrarComoInvitado}>
            Entrar sin credenciales
          </button>
        </form>

        {mensajeError && <p className="mensaje-error">{mensajeError}</p>}
        <p className="mensaje-demo">Si no escribes nada, entras en modo demo.</p>
      </section>
    </main>
  )
}

export default LoginPage
