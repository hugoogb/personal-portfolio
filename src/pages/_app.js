import "@/styles/globals.css";
import { Raleway } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";

const raleway = Raleway({ subsets: ["latin"] });

export default function App({ Component, pageProps }) {
	return (
		<main className={raleway.className}>
			<Component {...pageProps} />
			<Analytics />
		</main>
	);
}
