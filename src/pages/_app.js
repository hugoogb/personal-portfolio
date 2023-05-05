import { Analytics } from "@vercel/analytics/react";
import { Layout } from "@/components/Layout";
import "@/styles/globals.css";
import { Raleway } from "next/font/google";

const raleway = Raleway({ subsets: ["latin"] });

export default function App({ Component, pageProps }) {
	return (
		<main className={raleway.className}>
			<Layout>
				<Component {...pageProps} />
				<Analytics />
			</Layout>
		</main>
	);
}
