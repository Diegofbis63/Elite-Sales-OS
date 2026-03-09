/** @type {import('next').NextConfig} */
const nextConfig = {
    // Configuración de Next.js
    eslint: {
        ignoreDuringBuilds: true,
    },
    typescript: {
        ignoreBuildErrors: false,
    }
};

export default nextConfig;
