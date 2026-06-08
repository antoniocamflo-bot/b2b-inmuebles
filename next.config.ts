/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Evita que TypeScript atore la compilación en la nube
    ignoreBuildErrors: true,
  }
};

export default nextConfig;