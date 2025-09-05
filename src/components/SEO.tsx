import type { FC } from 'react';
import Head from 'next/head';

interface SEOProps {
  title: string;
  description: string;
  faviconPath?: string;
  canonicalUrl?: string;
  ogImage?: string;
}

export const SEO: FC<SEOProps> = ({ 
  title, 
  description, 
  faviconPath = '/favicon/home',
  canonicalUrl,
  ogImage 
}) => {
  return (
    <Head>
      <title>{title}</title>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="description" content={description} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
      {ogImage && <meta property="og:image" content={ogImage} />}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {ogImage && <meta name="twitter:image" content={ogImage} />}
      <link rel="apple-touch-icon" sizes="180x180" href={`${faviconPath}/apple-touch-icon.png`} />
      <link rel="icon" type="image/png" sizes="32x32" href={`${faviconPath}/favicon-32x32.png`} />
      <link rel="icon" type="image/png" sizes="16x16" href={`${faviconPath}/favicon-16x16.png`} />
      <link rel="manifest" href={`${faviconPath}/site.webmanifest`} />
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
    </Head>
  );
}; 