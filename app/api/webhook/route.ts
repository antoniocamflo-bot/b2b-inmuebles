export const dynamic = 'force-dynamic';

// ... (Todo el resto de tus importaciones y código de Stripe se quedan exactamente igual abajo)
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import { supabase } from "../../../lib/supabase"; // Ajusta la ruta si tu cliente está en otro lado

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2023-10-16" as any,
});

// El secreto del webhook lo conseguiremos en el siguiente paso con la CLI
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: Request) {
  const body = await req.text();
  const sig = (await headers()).get("stripe-signature");

  let event: Stripe.Event;

  try {
    if (!sig || !endpointSecret) {
      return NextResponse.json({ error: "Faltan firmas o secretos" }, { status: 400 });
    }
    // Verificamos que el evento realmente venga de Stripe y no sea un clon
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err: any) {
    console.error(`❌ Error de firma de Webhook: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // Escuchamos cuando una suscripción se crea o se paga con éxito
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    // Recuperamos el userId que guardamos en los metadatos en el paso anterior
    const userId = session.metadata?.userId;

    if (userId) {
      console.log(`¡Pago exitoso recibido para el usuario: ${userId}!`);

      // ACTUALIZAMOS SUPABASE: Le activamos la suscripción al proveedor
      const { error } = await supabase
        .from("usuarios") // <-- Cambia "usuarios" por el nombre real de tu tabla de perfiles
        .update({ suscripcion_activa: true }) // <-- Cambia por tu columna real
        .eq("id", userId);

      if (error) {
        console.error("Error al actualizar Supabase:", error);
        return NextResponse.json({ error: "Error al actualizar base de datos" }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ received: true }, { status: 200 });
}