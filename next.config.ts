/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Evita que TypeScript atore el servidor de Vercel
    ignoreBuildErrors: true,
  },
  eslint: {
    // Apaga el linter para agilizar el tiempo de compilación
    ignoreDuringBuilds: true,
  },
  // Desactiva los mapas de código pesados que agotan la RAM
  productionBrowserSourceMaps: false,
};

export default nextConfig;