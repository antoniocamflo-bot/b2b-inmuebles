'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'

export default function MisSolicitudes() {
  const router = useRouter()
  const [solicitudes, setSolicitudes] = useState<any[]>([])
  const [seleccionada, setSeleccionada] = useState(null)
  const [cotizaciones, setCotizaciones] = useState<any[]>([])

  // 1. Cargar las solicitudes del administrador
  useEffect(() => {
    const cargarDatos = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      const { data } = await supabase.from('solicitudes')
        .select('*')
        .eq('creado_por', user?.id)
        .order('created_at', { ascending: false })
      setSolicitudes(data || [])
    }
    cargarDatos()
  }, [])

  // 2. Cargar cotizaciones cuando se selecciona una solicitud
  const verDetalle = async (sol) => {
    setSeleccionada(sol)
    const { data } = await supabase.from('cotizaciones')
      .select('*, perfiles(*)') 
      .eq('solicitud_id', sol.id)
      .order('monto', { ascending: true })
    setCotizaciones(data || [])
  }

  const descargarPDF = () => {
    window.print()
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans pb-20">
      
      {/* SECCIÓN NO-PRINT */}
      <nav className="bg-gray-900 p-4 text-white shadow-md print:hidden">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="font-bold text-xl tracking-tight">B2B Inmuebles - Portal Cliente</h1>
          <div className="flex gap-3">
            <button onClick={() => window.location.href = '/admin-dashboard'} className="bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-lg text-sm transition font-bold">📊 Mi Dashboard</button>
            <button onClick={() => window.location.href = '/nueva-solicitud'} className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm transition font-bold">+ Nueva Solicitud</button>
            <button onClick={() => { supabase.auth.signOut(); window.location.href = '/' }} className="text-gray-400 hover:text-white px-4 py-2 rounded-lg text-sm transition">Salir</button>
          </div>
        </div>
      </nav>

      <main className="p-8 max-w-6xl mx-auto w-full">
        <h1 className="text-4xl font-black text-gray-900 mb-8 tracking-tighter print:hidden">Gestión de Proyectos</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* COLUMNA IZQUIERDA (Oculta al imprimir) */}
          <div className="space-y-4 print:hidden">
            <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest px-2">Mis Publicaciones</h2>
            {solicitudes.length === 0 && (
              <div className="p-6 border-2 border-dashed border-gray-300 rounded-2xl text-center">
                <p className="text-gray-500 text-sm">Aún no tienes proyectos publicados.</p>
              </div>
            )}
            {solicitudes.map(sol => (
              <div 
                key={sol.id} 
                onClick={() => verDetalle(sol)}
                className={`p-6 rounded-2xl cursor-pointer transition-all border-2 ${seleccionada?.id === sol.id ? 'border-blue-500 bg-white shadow-lg' : 'border-transparent bg-gray-200 hover:bg-gray-300'}`}
              >
                <p className="text-[10px] font-black text-blue-600 uppercase mb-1 tracking-widest">{sol.categoria}</p>
                <h3 className="font-black text-gray-800 text-lg leading-tight">{sol.titulo}</h3>
                <p className="text-gray-500 text-xs mt-2 font-bold uppercase tracking-tighter">📍 {sol.ubicacion}</p>
              </div>
            ))}
          </div>

          {/* COLUMNA DERECHA */}
          <div className="lg:col-span-2 print:w-full print:absolute print:top-0 print:left-0 print:bg-white">
            {seleccionada ? (
              <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-200 print:shadow-none print:border-none print:p-0">
                
                {/* Cabecera del PDF */}
                <div className="hidden print:flex justify-between items-center border-b-2 border-gray-900 pb-4 mb-6">
                  <div>
                    <h1 className="text-2xl font-black text-gray-900">B2B INMUEBLES</h1>
                    <p className="text-xs text-gray-500 font-bold uppercase">Orden de Adjudicación Formal de Obra / Compra</p>
                  </div>
                  <div className="text-right text-xs text-gray-500 font-bold">
                    <p>Fecha: {new Date().toLocaleDateString()}</p>
                    <p>ID Documento: #{seleccionada.id.substring(0,8).toUpperCase()}</p>
                  </div>
                </div>

                <div className="mb-8 border-b border-gray-100 pb-6 print:border-gray-300">
                  <div className="flex justify-between items-center mb-2">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest print:border print:border-gray-400 ${
                      seleccionada.estado === 'asignada' ? 'bg-blue-100 text-blue-700' : 
                      seleccionada.estado === 'completado' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'
                    }`}>
                      Estado: {seleccionada.estado}
                    </span>
  
                    <div className="flex gap-2 print:hidden">
                      {seleccionada.estado === 'asignada' && (
                        <button 
                          onClick={descargarPDF}
                          className="bg-gray-900 text-white px-4 py-2 rounded-xl font-black text-xs hover:bg-gray-800 transition-all flex items-center gap-1 shadow"
                        >
                          📥 Descargar Contrato / PDF
                        </button>
                      )}

                      {seleccionada.estado === 'asignada' && (
                        <button 
                          onClick={async () => {
                            const calificacion = prompt("Trabajo terminado. ¿Cuántas estrellas le das al proveedor? (1 al 5)");
                            const comentario = prompt("Deja un breve comentario sobre el servicio:");
          
                            if(calificacion && comentario) {
                              const { error: errorResena } = await supabase.from('resenas').insert([{
                                solicitud_id: seleccionada.id,
                                proveedor_id: cotizaciones[0]?.proveedor_id,
                                estrellas: parseInt(calificacion),
                                comentario: comentario
                              }]);

                              if (errorResena) {
                                alert("🚨 Error al guardar reseña: " + errorResena.message);
                                return;
                              }
            
                              const { error: errorUpdate } = await supabase.from('solicitudes')
                                .update({ estado: 'completado' })
                                .eq('id', seleccionada.id);

                              if (errorUpdate) {
                                alert("🚨 Error al completar solicitud: " + errorUpdate.message);
                                return;
                              }
            
                              alert("¡Gracias por calificar! Esto ayuda a la comunidad.");
                              window.location.reload();
                            }
                          }}
                          className="bg-purple-600 text-white px-4 py-2 rounded-xl font-black text-xs hover:bg-purple-700 transition-all"
                        >
                          Finalizar y Calificar ⭐️
                        </button>
                      )}
                    </div>
                  </div>
                  <h2 className="text-3xl font-black text-gray-900 mt-4 leading-none">{seleccionada.titulo}</h2>
                  <p className="text-gray-500 mt-3 font-medium text-sm leading-relaxed">{seleccionada.descripcion}</p>
                </div>

                <h3 className="text-xl font-black text-gray-800 mb-6 flex items-center print:text-base print:mb-4">
                  <span className="bg-blue-600 w-2 h-8 rounded-full mr-3 print:hidden"></span>
                  Propuesta Adjudicada y Proveedores
                </h3>

                {cotizaciones.length === 0 ? (
                  <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl p-12 text-center text-gray-400 font-bold uppercase tracking-widest text-xs">
                    Sin propuestas recibidas aún
                  </div>
                ) : (
                  <div className="overflow-hidden rounded-2xl border border-gray-200 shadow-sm print:border-gray-300 print:rounded-none">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-900 text-white print:bg-gray-200 print:text-black print:border-b print:border-gray-400">
                          <th className="p-4 text-[10px] font-black uppercase tracking-widest">Proveedor Electo</th>
                          <th className="p-4 text-[10px] font-black uppercase tracking-widest">Monto Convenido</th>
                          <th className="p-4 text-[10px] font-black uppercase tracking-widest">Tiempo estimado</th>
                          <th className="p-4 text-[10px] font-black uppercase tracking-widest print:hidden">Gestión</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 print:divide-gray-300">
                        {cotizaciones.map((cot, index) => (
                          <tr key={cot.id} className={`transition-all ${index === 0 ? 'bg-yellow-50/50 print:bg-gray-50' : 'hover:bg-blue-50/30 print:hidden'}`}>
                            <td className="p-4 relative">
                              {index === 0 && (
                                <span className="absolute top-0 left-0 bg-yellow-400 text-gray-900 text-[8px] font-black px-2 py-0.5 rounded-br-lg shadow-sm z-10 print:hidden">
                                 🌟 ELECTO
                                </span>
                              )}
                              <div className="pt-2">
                                {/* CORREGIDO: Enlace interactivo azul visible siempre para el portafolio */}
                                <button 
                                  onClick={() => window.open(`/perfil/${cot.proveedor_id}`, '_blank')}
                                  className="text-left group block mb-2"
                                >
                                  <p className="font-black text-blue-600 text-sm hover:text-blue-800 transition-colors underline decoration-dotted">
                                    {cot.perfiles?.nombre_empresa || cot.perfiles?.nombre_completo || `Proveedor #${index + 1}`}
                                    <span className="text-[10px] ml-1.5 font-bold inline-block bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-md no-underline">Ver Perfil Premium 📁</span>
                                  </p>
                                </button>
                                
                                <div className="text-[11px] text-gray-500 font-semibold mt-1 space-y-0.5">
                                  <p>👤 Contacto: {cot.perfiles?.nombre_completo || 'Representante'}</p>
                                  <p>✉️ Email: {cot.perfiles?.email || 'No registrado'}</p>
                                  <p>📞 Teléfono: {cot.perfiles?.telefono || 'No registrado'}</p>
                                </div>
                              </div>
                            </td>
                            <td className="p-4 font-black text-blue-700 text-xl print:text-black print:text-base">${cot.monto.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                            <td className="p-4 font-bold text-gray-700 text-xs">{cot.tiempo_entrega}</td>
                            <td className="p-4 flex gap-2 print:hidden">
                              {seleccionada.estado === 'abierta' && (
                                <button 
                                  onClick={async () => {
                                    const confirmacion = confirm("¿Deseas aceptar esta cotización? Se asignará formalmente.");
                                    if(confirmacion) {
                                      const montoAceptado = Number(cot.monto);
                                      const ofertaMasCara = Number(cotizaciones[cotizaciones.length - 1].monto);
                                      const ahorroCalculado = ofertaMasCara - montoAceptado;

                                      const { error } = await supabase.from('solicitudes')
                                        .update({ 
                                          estado: 'asignada',
                                          costo_final: montoAceptado,
                                          ahorro_generado: ahorroCalculado > 0 ? ahorroCalculado : 0,
                                          proveedor_asignado: cot.proveedor_id
                                        })
                                        .eq('id', seleccionada.id);
      
                                      if (error) {
                                        alert("🚨 Error de Supabase al Aceptar: " + error.message);
                                      } else {
                                        alert(`¡Proyecto asignado con éxito! Has ahorrado $${ahorroCalculado > 0 ? ahorroCalculado : 0} MXN.`);
                                        window.location.reload();
                                      }
                                   }
                                 }}
                                  className="bg-blue-600 text-white px-3 py-2 rounded-xl font-black text-[10px] hover:bg-gray-900 transition-all uppercase"
                                >
                                  Aceptar
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Pie de Firma */}
                <div className="hidden print:block mt-20 pt-8 border-t border-gray-300 text-center text-xs font-bold text-gray-400">
                  <div className="flex justify-around">
                    <div className="w-1/3 border-t border-gray-400 pt-2 text-gray-700">Firma Autorizada Comprador</div>
                    <div className="w-1/3 border-t border-gray-400 pt-2 text-gray-700">Firma de Conformidad Proveedor</div>
                  </div>
                  <p className="mt-8 text-[9px]">Este documento representa una adjudicación interna generada a través de B2B Inmuebles.</p>
                </div>

              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-300 border-2 border-dashed border-gray-200 rounded-[3rem] p-20 bg-gray-50/50 print:hidden">
                <p className="text-7xl mb-6 grayscale opacity-30">📂</p>
                <p className="font-black text-xs uppercase tracking-[0.2em] text-center text-gray-400">Selecciona un proyecto de la lista</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}