export const dynamic = 'force-dynamic';

// ... (Todo el resto de tus importaciones y código que ya tenías abajo se queda exactamente igual)
import { NextResponse } from "next/server";
import Stripe from "stripe";

// Inicializamos Stripe con la clave secreta que guardamos en tu archivo .env.local
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2023-10-16" as any, // Aseguramos compatibilidad de versión
});

export async function POST(request: Request) {
  try {
    const { priceId, userId } = await request.json();

    if (!priceId || !userId) {
      return NextResponse.json(
        { error: "Faltan datos obligatorios (priceId o userId)" },
        { status: 400 }
      );
    }

    // Creamos la sesión de pago en los servidores de Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId, // ID del plan/precio que crearemos en Stripe
          quantity: 1,
        },
      ],
      mode: "subscription", // Cambiar a 'payment' si fuera un pago único, pero este es membresía
      
      // Indicamos a dónde mandar al usuario tras el pago
      // Pasamos el userId en la URL para saber qué proveedor pagó cuando regrese
      success_url: `${request.headers.get("origin")}/dashboard?session_id={CHECKOUT_SESSION_ID}&success=true`,
      cancel_url: `${request.headers.get("origin")}/planes?canceled=true`,
      
      // Guardamos el userId en los metadatos de Stripe para recuperarlo en el webhook más adelante
      metadata: {
        userId: userId,
      },
    });

    // Le devolvemos al frontend la URL de la página de pago segura de Stripe
    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("Error en Stripe Checkout:", error);
    return NextResponse.json(
      { error: error.message || "Error interno del servidor" },
      { status: 500 }
    );
  }
}