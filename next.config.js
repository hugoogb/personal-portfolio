/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "hugoogb.dev",
			},
		],
	},
};

module.exports = nextConfig;
