'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

export default function NuevaSolicitud() {
  const [form, setForm] = useState({
    titulo: '',
    descripcion: '',
    categoria: '',
    ubicacion: '',
  })
  
  const [categoriasDB, setCategoriasDB] = useState<any[]>([])
  const [enviando, setEnviando] = useState(false)

  // CARGAR CATEGORÍAS DINÁMICAS DESDE SUPABASE
  useEffect(() => {
    const cargarCategorias = async () => {
      const { data, error } = await supabase
        .from('categorias')
        .select('*')
        .order('nombre', { ascending: true })
      
      if (data) {
        setCategoriasDB(data)
        if (data.length > 0) {
          setForm(prev => ({ ...prev, categoria: data[0].nombre }))
        }
      }
    }
    cargarCategorias()
  }, [])

  const manejarEnvio = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.categoria) {
      alert("Por favor selecciona una categoría")
      return
    }
    setEnviando(true)
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase.from('solicitudes').insert([
      {
        creado_por: user?.id,
        titulo: form.titulo,
        descripcion: form.descripcion,
        categoria: form.categoria,
        ubicacion: form.ubicacion,
        estado: 'abierta'
      }
    ])
    setEnviando(false)
    if (!error) {
      alert('¡Solicitud publicada con éxito!')
      window.location.href = '/dashboard'
    } else {
      alert('Error: ' + error.message)
    }
  }

  return (
    <div className="min-h-screen bg-gray-200 p-8 font-sans flex items-center justify-center">
      <div className="max-w-2xl w-full bg-white p-10 rounded-3xl shadow-2xl border border-gray-300">
        <h1 className="text-3xl font-black text-gray-900 mb-2">Crear Solicitud</h1>
        <p className="text-gray-600 mb-8 font-medium">Publica un requerimiento para los proveedores.</p>
        
        <form onSubmit={manejarEnvio} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">TÍTULO DEL PROYECTO</label>
            <input 
              required
              className="w-full p-4 bg-gray-100 border-2 border-gray-300 rounded-2xl focus:border-blue-600 text-gray-900 font-semibold"
              placeholder="Ej: Mantenimiento de subestación"
              value={form.titulo}
              onChange={(e) => setForm({...form, titulo: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">CATEGORÍA</label>
              <div className="relative">
                <select 
                  required
                  className="w-full p-4 bg-gray-100 border-2 border-gray-300 rounded-2xl focus:border-blue-600 text-gray-900 font-semibold outline-none appearance-none cursor-pointer pr-10"
                  value={form.categoria}
                  onChange={(e) => setForm({...form, categoria: e.target.value})}
                >
                  <option value="" disabled>Selecciona una...</option>
                  {categoriasDB.map(cat => (
                    <option key={cat.id} value={cat.nombre}>{cat.nombre}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-500">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">UBICACIÓN</label>
              <input 
                required
                className="w-full p-4 bg-gray-100 border-2 border-gray-300 rounded-2xl focus:border-blue-600 text-gray-900 font-semibold"
                placeholder="Torre Única CDMX"
                value={form.ubicacion}
                onChange={(e) => setForm({...form, ubicacion: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">DESCRIPCIÓN DETALLADA</label>
            <textarea 
              required
              rows={4}
              className="w-full p-4 bg-gray-100 border-2 border-gray-300 rounded-2xl focus:border-blue-600 text-gray-900 font-semibold"
              placeholder="Escribe aquí los detalles del trabajo..."
              value={form.descripcion}
              onChange={(e) => setForm({...form, descripcion: e.target.value})}
            />
          </div>

          <button 
            type="submit"
            disabled={enviando}
            className="w-full bg-blue-700 text-white font-black py-5 rounded-2xl hover:bg-blue-800 shadow-xl transition-all transform active:scale-95 text-lg"
          >
            {enviando ? 'PROCESANDO...' : 'PUBLICAR SOLICITUD'}
          </button>
        </form>
      </div>
    </div>
  )
}