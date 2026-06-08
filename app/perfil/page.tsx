'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function PerfilProveedor() {
  const [perfil, setPerfil] = useState<any>(null)
  const [subiendo, setSubiendo] = useState(false)

  useEffect(() => {
    const cargarPerfil = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      const { data } = await supabase.from('perfiles').select('*').eq('id', user?.id).single()
      setPerfil(data)
    }
    cargarPerfil()
  }, [])

  const subirFoto = async (e: any) => {
  try {
    setSubiendo(true)
    const file = e.target.files[0]
    if (!file) return

    const { data: { user } } = await supabase.auth.getUser()
    
    // Creamos un nombre super limpio: ID-FECHA.extensión
    const fileExt = file.name.split('.').pop()
    const fileName = `${user?.id}-${Date.now()}.${fileExt}`

    // 1. Subir a Storage
    const { error: uploadError } = await supabase.storage
      .from('proyectos')
      .upload(fileName, file)

    if (uploadError) throw uploadError

    // 2. Obtener URL pública (Aquí está el truco: usamos la URL que Supabase confirma)
    const { data } = supabase.storage.from('proyectos').getPublicUrl(fileName)
    const publicUrl = data.publicUrl

    // 3. Actualizar tabla perfiles
    const nuevasFotos = [...(perfil.fotos || []), publicUrl]
    await supabase.from('perfiles').update({ fotos: nuevasFotos }).eq('id', user?.id)
    
    setPerfil({...perfil, fotos: nuevasFotos})
    alert("¡Foto de trabajo añadida con éxito!")
    
  } catch (error) {
    console.error(error)
    alert("Error al subir: Asegúrate de que el bucket 'proyectos' sea público")
  } finally {
    setSubiendo(false)
  }
}

  if (!perfil) return <p className="p-10 text-center font-black">Cargando perfil profesional...</p>

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        {/* Encabezado de Perfil */}
        <div className="bg-white rounded-[3rem] p-10 shadow-xl mb-8 flex items-center gap-8 border border-gray-200">
          <div className="w-32 h-32 bg-blue-600 rounded-full flex items-center justify-center text-4xl text-white font-black shadow-inner">
             {perfil.nombre_empresa?.charAt(0) || "P"}
          </div>
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tighter">{perfil.nombre_empresa || "Tu Empresa"}</h1>
            <p className="text-blue-600 font-bold uppercase text-xs tracking-widest mt-1">Proveedor Verificado 🌟</p>
          </div>
        </div>

        {/* Galería de Trabajos Realizados */}
        <div className="bg-white rounded-[3rem] p-10 shadow-xl border border-gray-200">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Portafolio de Proyectos</h2>
            <label className="bg-gray-900 text-white px-6 py-3 rounded-2xl font-black text-xs cursor-pointer hover:bg-blue-600 transition-all">
              {subiendo ? "SUBIENDO..." : "+ AÑADIR FOTO"}
              <input type="file" hidden onChange={subirFoto} disabled={subiendo} />
            </label>
          </div>

          {perfil.fotos?.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {perfil.fotos.map((url: string, i: number) => (
                <img key={i} src={url} alt="Trabajo" className="w-full h-48 object-cover rounded-3xl border border-gray-100 shadow-sm" />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 border-2 border-dashed border-gray-100 rounded-[2rem] text-gray-400 font-bold uppercase text-xs tracking-widest">
               No has subido fotos de tus trabajos aún
            </div>
          )}
        </div>
      </div>
    </div>
  )
}