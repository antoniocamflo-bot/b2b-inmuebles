/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Evita que TypeScript gaste memoria validando tipos en la nube
    ignoreBuildErrors: true,
  },
  // Desactiva indicadores visuales pesados en la compilación
  productionBrowserSourceMaps: false,
};

export default nextConfig;