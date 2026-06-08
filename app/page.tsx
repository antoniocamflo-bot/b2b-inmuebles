'use client'

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center font-sans p-4">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-black text-blue-600 mb-4 tracking-tighter">B2B Inmuebles México</h1>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto font-medium">
          Conectamos administradores de inmuebles con los mejores proveedores de mantenimiento, seguridad y limpieza del país.
        </p>
        
        <div className="mt-6 inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-200">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Portal en Fase de Desarrollo</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full">
        {/* Tarjeta Proveedor */}
        <div className="bg-blue-600 rounded-3xl p-8 text-white shadow-xl transform transition hover:scale-105 flex flex-col justify-between">
          <div>
            <h2 className="text-2xl font-black mb-2">Panel Proveedores</h2>
            <p className="text-blue-100 mb-8 text-sm">Registra tu empresa, sube certificaciones y participa en subastas por contratos de mantenimiento.</p>
          </div>
          <button 
            onClick={() => window.location.href = '/login'}
            className="bg-white text-blue-600 font-black px-6 py-3 rounded-xl text-sm hover:bg-blue-50 transition-colors w-full uppercase tracking-wider shadow-md"
          >
            Entrar como Proveedor
          </button>
        </div>

        {/* Tarjeta Administrador */}
        <div className="bg-emerald-600 rounded-3xl p-8 text-white shadow-xl transform transition hover:scale-105 flex flex-col justify-between">
          <div>
            <h2 className="text-2xl font-black mb-2">Panel Compradores</h2>
            <p className="text-emerald-100 mb-8 text-sm">Publica tus necesidades y recibe cotizaciones de proveedores certificados al instante.</p>
          </div>
          <button 
            onClick={() => window.location.href = '/login'}
            className="bg-white text-emerald-600 font-black px-6 py-3 rounded-xl text-sm hover:bg-emerald-50 transition-colors w-full uppercase tracking-wider shadow-md"
          >
            Entrar como Administrador
          </button>
        </div>
      </div>
      
      <p className="mt-16 text-xs font-bold text-gray-400 uppercase tracking-widest">
        © 2026 B2B Inmuebles México - Seguridad y Confianza B2B.
      </p>
    </div>
  )
}