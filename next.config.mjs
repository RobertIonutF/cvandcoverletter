/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ['images.pexels.com'],
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'images.pexels.com',
                port: '',
                pathname: '/photos/**',
            },
        ],
    },
    // Configure external packages for server components
    experimental: {
        serverComponentsExternalPackages: ['pdf-parse', 'pdfjs-dist'],
    },
    // Allow workers to be loaded from node_modules
    webpack: (config) => {
        config.resolve.alias = {
            ...config.resolve.alias,
            'pdfjs-dist': 'pdfjs-dist/build/pdf.js',
        };
        return config;
    },
};

export default nextConfig;
