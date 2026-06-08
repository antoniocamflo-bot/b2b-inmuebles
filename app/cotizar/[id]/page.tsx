'use client'
import { useState } from 'react'
import { supabase } from '../../../lib/supabase'
import { useParams, useRouter } from 'next/navigation'

export default function PaginaCotizar() {
  const { id } = useParams()
  const router = useRouter()
  const [subtotal, setSubtotal] = useState<number>(0)
  const [tasaIva, setTasaIva] = useState<number>(0.16) // <-- 0.16 por defecto (16%)
  const [entrega, setEntrega] = useState('')
  const [propuesta, setPropuesta] = useState('')
  const [enviando, setEnviando] = useState(false)

  // Cálculos automáticos adaptables a la tasa seleccionada
  const iva = subtotal * tasaIva
  const total = subtotal + iva

  const enviarCotizacion = async (e: React.FormEvent) => {
    e.preventDefault()
    if (subtotal <= 0) {
      alert('Por favor, ingresa un monto válido superior a 0.')
      return
    }
    
    setEnviando(true)
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      const { error } = await supabase.from('cotizaciones').insert([
        {
          solicitud_id: id,
          proveedor_id: user?.id,
          monto: total, // Registra el total bruto real calculado
          tiempo_entrega: entrega,
          // Guardamos explícitamente el desglose fiscal en el texto técnico para el historial
          propuesta_tecnica: `[Subtotal: $${subtotal.toFixed(2)} | IVA (${tasaIva * 100}%): $${iva.toFixed(2)}] - ${propuesta}`
        }
      ])

      if (!error) {
        alert('¡Cotización formal enviada con éxito!');
        router.push('/dashboard')
      } else {
        alert('Error en base de datos: ' + error.message)
        setEnviando(false)
      }
    } catch (err: any) {
      alert('Error inesperado: ' + err.message)
      setEnviando(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8 flex justify-center items-center font-sans">
      <div className="bg-white p-10 rounded-[2.5rem] shadow-xl max-w-xl w-full border border-gray-200">
        
        {/* Encabezado */}
        <div className="border-b border-gray-100 pb-6 mb-6 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">Formato de Cotización</h2>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-1">Propuesta comercial para licitación</p>
          </div>
          <span className="text-3xl">📄</span>
        </div>

        <form onSubmit={enviarCotizacion} className="space-y-6">
          
          {/* Fila Financiera Desglosada */}
          <div className="bg-gray-50 p-6 rounded-3xl border-2 border-gray-100 space-y-4">
            
            {/* INPUT SUbtotal */}
            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Subtotal (MXN)</label>
              <input 
                required 
                type="number" 
                min="1"
                placeholder="Ej: 5000" 
                className="w-full p-4 bg-white border-2 border-gray-200 rounded-xl text-gray-900 font-bold focus:border-blue-500 outline-none transition-all" 
                onChange={(e) => setSubtotal(parseFloat(e.target.value) || 0)} 
              />
            </div>

            {/* NUEVO: Selector de Región Fiscal (IVA 16% vs 0%) */}
            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Región Fiscal / Impuesto</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setTasaIva(0.16)}
                  className={`p-3 rounded-xl border-2 text-xs font-black uppercase transition-all ${
                    tasaIva === 0.16 
                      ? 'border-blue-600 bg-blue-50 text-blue-700' 
                      : 'border-gray-200 bg-white text-gray-400 hover:border-gray-300'
                  }`}
                >
                  IVA General (16%)
                </button>
                <button
                  type="button"
                  onClick={() => setTasaIva(0)}
                  className={`p-3 rounded-xl border-2 text-xs font-black uppercase transition-all ${
                    tasaIva === 0 
                      ? 'border-blue-600 bg-blue-50 text-blue-700' 
                      : 'border-gray-200 bg-white text-gray-400 hover:border-gray-300'
                  }`}
                >
                  Frontera / Exento (0%)
                </button>
              </div>
            </div>

            {/* Cuadro de resumen fiscal dinámico */}
            <div className="pt-4 border-t border-gray-200 text-sm space-y-2 font-bold text-gray-600">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>${subtotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-gray-500 font-medium">
                <span>IVA ({tasaIva * 100}%):</span>
                <span>${iva.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-lg text-gray-900 font-black pt-2 border-t border-dashed border-gray-200">
                <span>Total Bruto (MXN):</span>
                <span className="text-blue-600">${total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Tiempo estimado de entrega</label>
            <input 
              required 
              type="text" 
              placeholder="Ej: 3 días hábiles a partir del anticipo" 
              className="w-full p-4 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 font-bold focus:border-blue-500 outline-none transition-all" 
              onChange={(e) => setEntrega(e.target.value)} 
            />
          </div>

          <div>
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Especificaciones y Alcance Técnico</label>
            <textarea 
              required 
              rows={4} 
              placeholder="Detalla qué incluye tu servicio, marcas de materiales, garantías..." 
              className="w-full p-4 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 font-semibold focus:border-blue-500 outline-none transition-all" 
              onChange={(e) => setPropuesta(e.target.value)} 
            />
          </div>

          <button 
            type="submit" 
            disabled={enviando} 
            className="w-full bg-blue-600 text-white font-black py-4 rounded-2xl hover:bg-blue-700 shadow-lg transition-all text-sm uppercase tracking-wider"
          >
            {enviando ? 'PROCESANDO ENVÍO...' : 'Firmar y Enviar Propuesta Formal'}
          </button>
        </form>
      </div>
    </div>
  )
}