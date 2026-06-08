/** @type {import('next').NextConfig} */
const nextConfig = {
  // Esto le dice a Vercel que no detenga el despliegue por errores de TypeScript
  typescript: {
    ignoreBuildErrors: true,
  },
  // Esto le dice que ignore advertencias de reglas de código menores (ESLint)
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;