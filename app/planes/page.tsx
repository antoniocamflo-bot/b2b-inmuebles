"use client";

import { useState, useEffect } from "react";
// Corregimos el import para usar tu cliente de Supabase ya existente
import { supabase } from "../../lib/supabase";

export default function PaginaPlanes() {
  const [userId, setUserId] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  // Tu ID de precio de Stripe de $299 MXN
  const PRICE_ID = "price_1TaLZjEZcn7bM4Z5DaDgauGf";

  // Obtenemos el usuario activo al cargar la página usando tu cliente estándar
  useEffect(() => {
    const obtenerUsuario = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserId(user.id);
    };
    obtenerUsuario();
  }, []);

  const manejarSuscripcion = async () => {
    if (!userId) {
      alert("Por favor, inicia sesión para poder adquirir un plan.");
      return;
    }

    setCargando(true);

    try {
      const respuesta = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          priceId: PRICE_ID,
          userId: userId,
        }),
      });

      const datos = await respuesta.json();

      if (datos.url) {
        window.location.href = datos.url;
      } else {
        alert("Hubo un problema al generar la sesión de pago.");
        setCargando(false);
      }
    } catch (error) {
      console.error("Error al conectar con Stripe:", error);
      alert("Error de conexión.");
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 py-20 px-8 font-sans">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-5xl font-black text-white mb-4 tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
          Escala tu Negocio
        </h1>
        <p className="text-gray-400 font-medium mb-16 uppercase tracking-[0.3em] text-xs">
          Acceso ilimitado a licitaciones premium
        </p>
        
        <div className="bg-white rounded-[3rem] p-12 shadow-2xl relative overflow-hidden max-w-md mx-auto">
          <div className="absolute top-0 right-0 bg-blue-600 text-white px-8 py-2 rounded-bl-3xl font-black text-xs">
            RECOMENDADO
          </div>
          <h2 className="text-3xl font-black text-gray-900 mb-2">Plan Proveedor</h2>
          <div className="flex justify-center items-baseline my-8">
            <span className="text-5xl font-black text-gray-900">$299</span>
            <span className="text-gray-400 font-bold ml-2">/ mes</span>
          </div>
          <ul className="text-left space-y-4 mb-10">
            <li className="flex items-center text-gray-600 font-bold text-sm">✅ Ver todas las solicitudes</li>
            <li className="flex items-center text-gray-600 font-bold text-sm">✅ Cotizaciones ilimitadas</li>
            <li className="flex items-center text-gray-600 font-bold text-sm">✅ Insignia de Proveedor Verificado</li>
            <li className="flex items-center text-gray-600 font-bold text-sm">✅ Alertas por WhatsApp</li>
          </ul>
          <button 
            onClick={manejarSuscripcion}
            disabled={cargando}
            className="w-full bg-gray-900 text-white py-5 rounded-3xl font-black text-sm hover:scale-105 transition-all shadow-xl disabled:opacity-50"
          >
            {cargando ? "CARGANDO..." : "SUSCRIBIRME AHORA"}
          </button>
        </div>
      </div>
    </div>
  );
}