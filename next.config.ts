/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Evita que TypeScript agote los recursos del servidor validando tipos en la nube
    ignoreBuildErrors: true,
  },
  eslint: {
    // Omitimos validaciones estéticas de código durante la compilación
    ignoreDuringBuilds: true,
  },
  // Desactiva los mapas de código pesados que se comen la memoria RAM de Vercel
  productionBrowserSourceMaps: false,
};

export default nextConfig;