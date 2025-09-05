/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	experimental: {
		optimizePackageImports: ['@tabler/icons-react'],
	},
	images: {
		formats: ['image/webp', 'image/avif'],
		minimumCacheTTL: 31536000, // 1 year
	},
	compiler: {
		removeConsole: process.env.NODE_ENV === 'production',
	},
	poweredByHeader: false,
	compress: true,
};

module.exports = nextConfig;
