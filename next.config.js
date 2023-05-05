/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "hugoogb.dev",
				port: "",
				pathname: "",
			},
		],
	},
};

module.exports = nextConfig;
