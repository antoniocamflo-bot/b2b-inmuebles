'use client'
import { useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [cargando, setCargando] = useState(false)
  const [esRegistro, setEsRegistro] = useState(false)
  // NUEVO ESTADO: Para saber qué rol quiere el usuario
  const [rolRegistro, setRolRegistro] = useState('proveedor') 

  const manejarAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setCargando(true)
    
    if (esRegistro) {
      // LÓGICA DE REGISTRO CON ROL DINÁMICO
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nombre_completo: rolRegistro === 'admin' ? 'Nuevo Administrador' : 'Nuevo Proveedor',
            rol: rolRegistro // Aquí enviamos lo que el usuario eligió
          }
        }
      })
      
      if (error) {
        alert('Error al registrar: ' + error.message)
      } else {
        alert('¡Registro exitoso! Ya puedes iniciar sesión.')
        setEsRegistro(false)
        setPassword('')
      }
    } else {
      // LÓGICA DE INICIO DE SESIÓN
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) {
        alert('Error: Credenciales incorrectas o usuario no encontrado.')
      } else {
        // Redirigir dependiendo del rol que tenga en la base de datos
        const rol = data.user?.user_metadata?.rol
        if (rol === 'admin') {
          window.location.href = '/mis-solicitudes'
        } else {
          window.location.href = '/dashboard'
        }
      }
    }
    setCargando(false)
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 font-sans">
      <div className="bg-white p-10 rounded-3xl shadow-xl max-w-md w-full border border-gray-200">
        <h2 className="text-3xl font-black text-center text-gray-900 mb-2">
          {esRegistro ? 'Crear Cuenta' : 'Bienvenido'}
        </h2>
        <p className="text-center text-gray-500 mb-8 font-medium">
          {esRegistro ? 'Únete a la plataforma B2B' : 'Ingresa tus credenciales para continuar'}
        </p>
        
        <form onSubmit={manejarAuth} className="space-y-6">
          
          {/* NUEVO: SELECTOR DE ROL (Solo visible si es registro) */}
          {esRegistro && (
            <div className="mb-4">
              <label className="block text-sm font-bold text-gray-900 mb-2">TIPO DE CUENTA</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setRolRegistro('proveedor')}
                  className={`flex-1 py-3 rounded-xl font-bold text-xs uppercase transition-all border-2 ${rolRegistro === 'proveedor' ? 'bg-blue-50 border-blue-600 text-blue-700' : 'bg-gray-50 border-gray-200 text-gray-500 hover:border-gray-300'}`}
                >
                  Soy Proveedor
                </button>
                <button
                  type="button"
                  onClick={() => setRolRegistro('admin')}
                  className={`flex-1 py-3 rounded-xl font-bold text-xs uppercase transition-all border-2 ${rolRegistro === 'admin' ? 'bg-emerald-50 border-emerald-600 text-emerald-700' : 'bg-gray-50 border-gray-200 text-gray-500 hover:border-gray-300'}`}
                >
                  Soy Comprador
                </button>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">CORREO ELECTRÓNICO</label>
            <input 
              type="email" 
              required
              className="w-full p-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-blue-600 outline-none transition-all text-gray-900 font-bold placeholder-gray-400"
              placeholder="correo@ejemplo.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">CONTRASEÑA</label>
            <input 
              type="password" 
              required
              className="w-full p-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-blue-600 outline-none transition-all text-gray-900 font-bold placeholder-gray-400"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>

          <button 
            disabled={cargando} 
            className="w-full bg-blue-600 text-white font-black py-4 rounded-xl hover:bg-blue-700 transition-all uppercase tracking-widest text-sm shadow-md"
          >
            {cargando ? 'Procesando...' : (esRegistro ? 'Registrarse' : 'Iniciar Sesión')}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button 
            onClick={() => setEsRegistro(!esRegistro)}
            className="text-sm font-bold text-gray-500 hover:text-blue-600 transition-colors"
          >
            {esRegistro ? '¿Ya tienes cuenta? Inicia sesión aquí' : '¿No tienes cuenta? Regístrate aquí'}
          </button>
        </div>
      </div>
    </div>
  )
}