/** @type {import('next').NextConfig} */
const nextConfig = {
    typescript: {
        // Ignore TypeScript build errors during deployment
        ignoreBuildErrors: true,
    },
    eslint: {
        // Ignore ESLint errors during deployment
        ignoreDuringBuilds: true,
    },
}

export default nextConfig
