'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function AdminDashboard() {
  const [nombre, setNombre] = useState('Cargando...')
  const [metricas, setMetricas] = useState({
    proyectosFinalizados: 0,
    inversionTotal: 0,
    ahorroTotal: 0
  })
  const [historial, setHistorial] = useState<any[]>([])

  useEffect(() => {
    const cargarDatos = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setNombre(user.user_metadata.nombre_completo || 'Administrador')

        // Cargar TODOS los proyectos de este usuario que estén "completados"
        const { data: proyectos } = await supabase
          .from('solicitudes')
          .select('*')
          .eq('creado_por', user.id)
          .eq('estado', 'completado')
          .order('created_at', { ascending: false })

        if (proyectos) {
          setHistorial(proyectos)
          
          // Calcular sumatorias
          const totalInversion = proyectos.reduce((sum, p) => sum + (Number(p.costo_final) || 0), 0)
          const totalAhorro = proyectos.reduce((sum, p) => sum + (Number(p.ahorro_generado) || 0), 0)

          setMetricas({
            proyectosFinalizados: proyectos.length,
            inversionTotal: totalInversion,
            ahorroTotal: totalAhorro
          })
        }
      }
    }
    cargarDatos()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans pb-20">
      {/* Navegación Superior */}
      <nav className="bg-gray-900 p-4 text-white shadow-md">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="font-bold text-xl tracking-tight">B2B Inmuebles - Portal Cliente</h1>
          <div className="flex gap-3">
            <button onClick={() => window.location.href = '/nueva-solicitud'} className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm transition font-bold">+ Nueva Solicitud</button>
            <button onClick={() => window.location.href = '/mis-solicitudes'} className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg text-sm transition">Gestión de Licitaciones</button>
            <button onClick={() => { supabase.auth.signOut(); window.location.href = '/' }} className="text-gray-400 hover:text-white px-4 py-2 rounded-lg text-sm transition">Salir</button>
          </div>
        </div>
      </nav>

      <main className="p-8 max-w-6xl mx-auto w-full">
        <div className="mb-8">
          <h2 className="text-3xl font-black text-gray-900">Resumen Financiero</h2>
          <p className="text-gray-500 mt-1 font-medium">Bienvenido, {nombre}. Aquí está el rendimiento de tus proyectos.</p>
        </div>

        {/* Tarjetas de KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-blue-500">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Proyectos Finalizados</p>
            <p className="text-3xl font-black text-gray-800">{metricas.proyectosFinalizados}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-purple-500">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Inversión Total</p>
            <p className="text-3xl font-black text-gray-800">${metricas.inversionTotal.toLocaleString('es-MX')}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-emerald-500">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Ahorro Generado</p>
            <p className="text-3xl font-black text-emerald-600">${metricas.ahorroTotal.toLocaleString('es-MX')}</p>
          </div>
        </div>

        {/* Tabla de Historial */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <span className="bg-blue-600 w-2 h-6 rounded-full mr-3"></span>
            Historial de Cierres
          </h3>
          
          {historial.length === 0 ? (
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-12 text-center">
              <p className="text-gray-400 text-sm italic font-medium">Aún no tienes proyectos completados.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    <th className="p-3">Proyecto</th>
                    <th className="p-3">Categoría</th>
                    <th className="p-3">Inversión</th>
                    <th className="p-3">Ahorro</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {historial.map(proj => (
                    <tr key={proj.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-3 font-bold text-gray-800">{proj.titulo}</td>
                      <td className="p-3 text-xs font-bold text-blue-600 bg-blue-50 rounded-lg inline-block mt-2 px-2 py-1">{proj.categoria}</td>
                      <td className="p-3 font-bold text-gray-700">${Number(proj.costo_final || 0).toLocaleString('es-MX')}</td>
                      <td className="p-3 font-bold text-emerald-600">+${Number(proj.ahorro_generado || 0).toLocaleString('es-MX')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}