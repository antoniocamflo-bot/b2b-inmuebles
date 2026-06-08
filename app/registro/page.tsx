'use client'
import { useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function Registro() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nombre, setNombre] = useState('')
  const [mensaje, setMensaje] = useState('')

  const manejarRegistro = async (e: React.FormEvent) => {
    e.preventDefault()
    setMensaje('Procesando registro...')

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          nombre_completo: nombre,
          rol: 'proveedor'
        }
      }
    })

    if (error) {
      setMensaje('Error: ' + error.message)
    } else {
      setMensaje('¡Registro exitoso! Entrando a tu panel...')
      
      // Esperamos 2 segundos para que alcances a ver el mensaje verde
      setTimeout(() => {
        window.location.href = '/dashboard'
      }, 2000)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <form onSubmit={manejarRegistro} className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md border border-gray-200">
        <h2 className="text-3xl font-bold text-blue-700 mb-8 text-center">Registro de Proveedores</h2>
        
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Nombre de la Empresa</label>
            <input 
              type="text" placeholder="Ej. Mantenimiento Total S.A."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 placeholder-gray-400"
              value={nombre} onChange={(e) => setNombre(e.target.value)} required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Correo Electrónico</label>
            <input 
              type="email" placeholder="correo@empresa.com"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 placeholder-gray-400"
              value={email} onChange={(e) => setEmail(e.target.value)} required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Contraseña</label>
            <input 
              type="password" placeholder="Mínimo 6 caracteres"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 placeholder-gray-400"
              value={password} onChange={(e) => setPassword(e.target.value)} required
            />
          </div>
        </div>

        <button type="submit" className="w-full mt-8 bg-blue-600 text-white p-4 rounded-xl font-bold text-lg hover:bg-blue-700 shadow-lg transition-all active:scale-95">
          Crear Cuenta de Proveedor
        </button>

        {mensaje && (
          <div className={`mt-6 p-3 rounded-lg text-center text-sm font-bold ${mensaje.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            {mensaje}
          </div>
        )}
      </form>
    </div>
  )
}