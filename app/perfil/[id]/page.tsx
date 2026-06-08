'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'
import { useParams } from 'next/navigation'

export default function PerfilPublico() {
  const { id } = useParams()
  const [perfil, setPerfil] = useState<any>(null)

  useEffect(() => {
    const cargarPerfil = async () => {
      const { data } = await supabase.from('perfiles').select('*').eq('id', id).single()
      setPerfil(data)
    }
    cargarPerfil()
  }, [id])

  if (!perfil) return <p className="p-10 text-center font-black text-gray-500 animate-pulse">Cargando perfil del proveedor...</p>

  // Variable de control para simular o leer si es usuario de $499
  const esUltraPremium = perfil.suscripcion_activa || false

  // Codificar la ubicación para el mapa dinámico (si no tiene, toma México por defecto)
  const ciudadMapa = encodeURIComponent(perfil.ubicacion || 'México')

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-20">
      
      {/* 1. PORTADA DINÁMICA PREMIUM */}
      <div className={`w-full h-64 relative transition-all duration-500 ${
        esUltraPremium 
          ? 'bg-gradient-to-r from-blue-700 via-indigo-800 to-purple-900 shadow-inner' 
          : 'bg-gray-300'
      }`}>
        {esUltraPremium && (
          <div className="absolute top-4 right-4 bg-yellow-400 text-gray-900 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-md border border-yellow-300 animate-bounce">
            ⭐ Aliado Verificado Premium
          </div>
        )}
      </div>

      <div className="max-w-4xl mx-auto px-6 -mt-24 relative z-10">
        
        {/* Tarjeta Principal de Identidad */}
        <div className="bg-white rounded-[2.5rem] p-8 shadow-xl mb-8 flex flex-col md:flex-row items-center gap-6 border border-gray-100">
          <div className={`w-28 h-28 rounded-full flex items-center justify-center text-4xl text-white font-black shadow-lg border-4 border-white ${
            esUltraPremium ? 'bg-gradient-to-tr from-blue-600 to-purple-600' : 'bg-gray-500'
          }`}>
            {perfil.nombre_empresa?.charAt(0) || "P"}
          </div>
          <div className="text-center md:text-left flex-1">
            <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center justify-center md:justify-start gap-2">
              {perfil.nombre_empresa}
            </h1>
            <p className="text-sm text-gray-400 font-bold uppercase tracking-wider mt-0.5">⚙️ Ramo: {perfil.especialidades?.join(', ') || 'General'}</p>
            
            <div className="flex items-center justify-center md:justify-start text-yellow-400 text-sm mt-2">
              {"★".repeat(Math.floor(perfil.reputacion || 5))} 
              <span className="ml-2 text-gray-500 font-black text-xs bg-gray-100 px-2 py-0.5 rounded-md">({perfil.reputacion || 5}.0 / 5)</span>
            </div>
          </div>
        </div>

        {/* Distribución de Bloques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Columna Izquierda: Portafolio (Ocupa 2 columnas) */}
          <div className="md:col-span-2 space-y-8">
            <div className="bg-white rounded-[2.5rem] p-8 shadow-md border border-gray-100">
              <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6 pb-2 border-b border-gray-50">📂 Portafolio de Proyectos Ejecutados</h2>
              
              {!perfil.fotos || perfil.fotos.length === 0 ? (
                <div className="p-8 border-2 border-dashed border-gray-200 rounded-2xl text-center text-sm italic text-gray-400">
                  No hay fotografías cargadas en el catálogo.
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {perfil.fotos?.map((url: string, i: number) => (
                    <img key={i} src={url} alt="Trabajo" className="w-full h-44 object-cover rounded-2xl shadow-sm hover:scale-[1.02] transition-all duration-300" />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Columna Derecha: INFRAESTRUCTURA DE UBICACIÓN PREMIUM (Ocupa 1 columna) */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-[2.5rem] p-6 shadow-md border border-gray-100 h-fit sticky top-6">
              <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 pb-2 border-b border-gray-50">📍 Zona de Cobertura</h2>
              
              <p className="text-sm font-bold text-gray-800 mb-4 bg-blue-50 text-blue-700 px-3 py-2 rounded-xl border border-blue-100 inline-block">
                🏢 Base: {perfil.ubicacion || 'No especificada'}
              </p>

              {/* 2. MAPA INTERACTIVO CONDICIONAL */}
              {esUltraPremium ? (
                <div className="w-full h-64 rounded-2xl overflow-hidden border-2 border-gray-200 shadow-inner">
                  <iframe 
                    width="100%" 
                    height="100%" 
                    src={`https://maps.google.com/maps?q=${ciudadMapa}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
                    frameBorder="0" 
                    scrolling="no" 
                    marginHeight={0} 
                    marginWidth={0}
                    className="grayscale opacity-90"
                  ></iframe>
                </div>
              ) : (
                /* Candado Comercial para inducir a la compra de $499 */
                <div className="w-full h-64 rounded-2xl bg-gray-100 border border-dashed border-gray-300 flex flex-col items-center justify-center p-4 text-center">
                  <span className="text-2xl mb-2">🔒</span>
                  <p className="text-xs font-black text-gray-800 uppercase tracking-tight">Mapa de Geolocalización</p>
                  <p className="text-[10px] text-gray-400 font-bold mt-1 leading-tight">MÓDULO EXCLUSIVO PARA CUENTAS ULTRA PREMIUM</p>
                  <button 
                    onClick={() => window.location.href = '/planes'}
                    className="mt-4 bg-gray-900 text-white text-[9px] font-black uppercase px-3 py-2 rounded-xl hover:bg-blue-600 transition-all shadow"
                  >
                    Mejorar a Plan $499
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}