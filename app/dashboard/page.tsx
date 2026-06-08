'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function Dashboard() {
  const [nombre, setNombre] = useState('Cargando...')
  const [misEspecialidades, setMisEspecialidades] = useState<string[]>([])
  const [solicitudes, setSolicitudes] = useState<any[]>([])
  const [guardando, setGuardando] = useState(false)
  // Dejamos el estado por si se ocupa, pero para la Beta Gratis forzaremos el acceso libre
  const [esPremium, setEsPremium] = useState(true) 
  const [proyectosGanados, setProyectosGanados] = useState<any[]>([])
  
  // ESTADOS PARA CATEGORÍAS DINÁMICAS
  const [todasCategorias, setTodasCategorias] = useState<any[]>([])
  const [nuevaCat, setNuevaCat] = useState('')

  // 1. Cargar datos iniciales, suscripción y CATEGORÍAS desde la DB
  useEffect(() => {
    const obtenerDatosYPremium = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setNombre(user.user_metadata.nombre_completo || 'Proveedor')
        
        // Cargar perfil
        const { data: perfil } = await supabase.from('perfiles')
          .select('especialidades, suscripcion_activa')
          .eq('id', user.id)
          .single()
        
        if (perfil) {
          setMisEspecialidades(perfil.especialidades || [])
          setEsPremium(true) 
        }

        // CARGAR CATEGORÍAS DESDE LA TABLA 'categorias'
        const { data: cats, error } = await supabase
          .from('categorias')
          .select('*')
          .order('nombre', { ascending: true })
        
        if (!error) setTodasCategorias(cats || [])

        // --- CORREGIDO: CARGA DIRECTA CON TU COLUMNA REAL proveedor_asignado ---
        const { data: ganados } = await supabase
          .from('solicitudes')
          .select('*')
          .eq('proveedor_asignado', user.id) // <-- Corregido el nombre de tu columna
          .eq('estado', 'asignada');

        if (ganados && ganados.length > 0) {
          // Buscamos los datos del comprador de forma independiente
          const promesas = ganados.map(async (proyecto) => {
            const { data: perfilComprador } = await supabase
              .from('perfiles')
              .select('nombre_completo, telefono, email')
              .eq('id', proyecto.creado_por)
              .single();
            
            return {
              ...proyecto,
              comprador: perfilComprador || {
                nombre_completo: 'Administrador Inmobiliario',
                telefono: '',
                email: 'soporte@b2binmuebles.com'
              }
            };
          });

          const proyectosConContacto = await Promise.all(promesas);
          setProyectosGanados(proyectosConContacto);
        } else {
          setProyectosGanados([]);
        }
        // ------------------------------------------------------------
      }
    }
    obtenerDatosYPremium()
  }, [])

  // 2. Cargar solicitudes que coincidan con las especialidades elegidas
  useEffect(() => {
    const cargarSolicitudes = async () => {
      if (misEspecialidades.length === 0) {
        setSolicitudes([])
        return
      }
      const { data, error } = await supabase
        .from('solicitudes')
        .select('*')
        .in('categoria', misEspecialidades)
        .eq('estado', 'abierta')
        .order('created_at', { ascending: false })
      
      if (error) console.error("Error cargando solicitudes:", error)
      setSolicitudes(data || [])
    }
    cargarSolicitudes()
  }, [misEspecialidades])

  // 3. Lógica para seleccionar/deseleccionar especialidad
  const toggleEspecialidad = (catNombre: string) => {
    setMisEspecialidades(prev => 
      prev.includes(catNombre) ? prev.filter(i => i !== catNombre) : [...prev, catNombre]
    )
  }

  // 4. Lógica para AÑADIR UNA NUEVA CATEGORÍA a la base de datos
  const agregarCategoriaPersonalizada = async () => {
    if (!nuevaCat.trim()) return
    
    const nombreLimpio = nuevaCat.trim()

    // Insertar en la tabla global de categorías
    const { data, error } = await supabase
      .from('categorias')
      .insert([{ nombre: nombreLimpio }])
      .select()

    if (error) {
      if (error.code === '23505') { 
        if (!misEspecialidades.includes(nombreLimpio)) {
          setMisEspecialidades([...misEspecialidades, nombreLimpio])
        }
      } else {
        alert("Hubo un error al intentar añadir la categoría.")
      }
    } else if (data) {
      setTodasCategorias(prev => [...prev, data[0]].sort((a, b) => a.nombre.localeCompare(b.nombre)))
      setMisEspecialidades(prev => [...prev, nombreLimpio])
      alert(`¡"${nombreLimpio}" añadida al catálogo!`)
    }
    setNuevaCat('')
  }

  const guardarPerfil = async () => {
    setGuardando(true)
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase.from('perfiles').update({
      especialidades: misEspecialidades
    }).eq('id', user?.id)
    
    setGuardando(false)
    if (!error) alert('¡Perfil y oportunidades actualizados!')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans pb-20">
      <nav className="bg-blue-700 p-4 text-white shadow-md">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="font-bold text-xl tracking-tight">B2B Inmuebles - Panel de Control</h1>
          <button onClick={() => { supabase.auth.signOut(); window.location.href = '/' }} className="bg-blue-800 hover:bg-blue-900 px-4 py-2 rounded-lg text-sm transition">Cerrar Sesión</button>
        </div>
      </nav>

      <main className="p-8 max-w-6xl mx-auto w-full">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 mb-8 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 italic">¡Bienvenido, {nombre}!</h2>
            <p className="text-gray-500 mt-2">Gestiona tus servicios y encuentra nuevas oportunidades.</p>
          </div>
        </div>

        {/* --- NOTIFICACIONES DE PROYECTOS GANADOS CON ENLACE DIRECTO --- */}
        {proyectosGanados.length > 0 && (
          <div className="mb-8 space-y-4">
            {proyectosGanados.map(proyecto => (
              <div key={proyecto.id} className="bg-gradient-to-r from-emerald-500 to-teal-600 p-8 rounded-3xl shadow-xl border border-emerald-300 text-white relative overflow-hidden">
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-emerald-700/50 text-emerald-100 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full">
                      🎉 ¡Propuesta Seleccionada!
                    </span>
                  </div>
                  <h3 className="text-2xl font-black tracking-tight">Has ganado la licitación: {proyecto.titulo}</h3>
                  <p className="text-sm font-medium opacity-90 mt-1">Lugar de entrega/obra: <span className="font-bold underline">{proyecto.ubicacion}</span></p>
          
                  {/* Canales de contacto automáticos */}
                  <div className="mt-6 pt-6 border-t border-emerald-400/40 grid grid-cols-1 md:grid-cols-3 gap-4 bg-emerald-950/20 p-4 rounded-2xl">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-200">Contacto del Cliente</p>
                      <p className="text-sm font-black mt-0.5">{proyecto.comprador?.nombre_completo || 'Administrador Inmobiliario'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-200">Correo Electrónico</p>
                      <a href={`mailto:${proyecto.comprador?.email}`} className="text-sm font-bold underline hover:text-emerald-100 block mt-0.5 break-all">
                        {proyecto.comprador?.email || 'soporte@b2binmuebles.com'}
                      </a>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-200">Enlace de Comunicación</p>
                      <a 
                        href={`https://wa.me/${proyecto.comprador?.telefono?.replace(/[^0-9]/g, '')}`} 
                        target="_blank" 
                        className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs px-3 py-1.5 rounded-xl shadow-sm transition-all mt-1"
                      >
                        💬 Contactar por WhatsApp
                      </a>
                    </div>
                  </div>
                </div>
                <div className="absolute right-4 bottom-2 text-9xl opacity-10 pointer-events-none select-none font-black">🏆</div>
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* COLUMNA IZQUIERDA: CATEGORÍAS DINÁMICAS */}
          <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">
            <h3 className="text-xl font-bold text-gray-700 mb-4">Tus Especialidades</h3>
            
            <div className="flex gap-2 mb-6">
              <input 
                type="text"
                placeholder="¿Falta tu ramo? Escríbelo..."
                value={nuevaCat}
                onChange={(e) => setNuevaCat(e.target.value)}
                className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-900 font-medium placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <button 
                onClick={agregarCategoriaPersonalizada}
                className="bg-gray-900 text-white px-3 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-blue-600 transition-all"
              >
                Añadir
              </button>
            </div>

            <div className="flex flex-wrap gap-2 mb-6 max-h-72 overflow-y-auto p-1 border-b border-gray-50">
              {todasCategorias.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => toggleEspecialidad(cat.nombre)}
                  className={`text-xs px-3 py-2 rounded-lg border transition-all ${
                    misEspecialidades.includes(cat.nombre) 
                    ? 'border-blue-500 bg-blue-50 text-blue-700 font-bold' 
                    : 'border-gray-100 text-gray-400 hover:border-gray-200'
                  }`}
                >
                  {cat.nombre}
                </button>
              ))}
            </div>

            <button 
              onClick={guardarPerfil}
              disabled={guardando}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-xl shadow-lg transition-all text-sm"
            >
              {guardando ? 'Guardando...' : 'Actualizar Filtros'}
            </button>
          </div>

          {/* COLUMNA DERECHA: SOLICITUDES */}
          <div className="lg:col-span-2">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <span className="bg-blue-600 w-2 h-8 rounded-full mr-3"></span>
                Oportunidades para ti
            </h3>

            {solicitudes.length === 0 ? (
              <div className="bg-white p-12 rounded-2xl border-2 border-dashed border-gray-200 text-center">
                <p className="text-gray-400 text-lg italic">Selecciona tus especialidades para ver trabajos disponibles.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {solicitudes.map((sol) => (
                  <div key={sol.id} className="bg-white p-6 rounded-3xl shadow-lg border border-gray-100 relative overflow-hidden">
                    
                    {/* El candado condicional se eliminó aquí para permitir el acceso libre a la Beta */}

                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-[10px] font-black uppercase">
                          {sol.categoria}
                        </span>
                        <span className="text-gray-400 text-[10px] font-bold">{new Date(sol.created_at).toLocaleDateString()}</span>
                      </div>
                      <h3 className="text-xl font-black text-gray-900 mb-2 leading-tight">{sol.titulo}</h3>
                      <p className="text-gray-500 text-sm mb-4 line-clamp-2">{sol.descripcion}</p>
                      <div className="flex items-center text-gray-700 text-xs font-bold mb-6">
                        <span className="mr-4">📍 {sol.ubicacion}</span>
                        <span>⏱️ {sol.urgencia}</span>
                      </div>
                      <button 
                        onClick={() => window.location.href = `/cotizar/${sol.id}`}
                        className="w-full bg-blue-600 text-white py-3 rounded-2xl font-black text-xs hover:bg-blue-700 transition-all"
                      >
                        Cotizar Ahora
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}