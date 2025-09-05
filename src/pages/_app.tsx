import type { AppProps } from 'next/app';
import { Analytics } from "@vercel/analytics/react";
import { Layout } from "@/components/Layout";
import "@/styles/globals.css";
import { Raleway } from "next/font/google";

const raleway = Raleway({ 
  subsets: ["latin"],
  display: 'swap',
  fallback: ['system-ui', 'sans-serif']
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <main className={raleway.className}>
      <Layout>
        <Component {...pageProps} />
        <Analytics />
      </Layout>
    </main>
  );
}
