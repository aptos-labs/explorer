/**
 * Hook for managing page metadata (title, description, etc.)
 * Uses react-helmet-async for SSR-compatible meta tag management
 */

import {useEffect} from "react";
import {Helmet} from "react-helmet-async";

interface PageMetadataProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
}

/**
 * Hook to set page metadata - for use in non-component contexts
 * For component usage, use the PageMetadata component instead
 */
export function usePageMetadata({
  title,
  description,
  image,
  url,
}: PageMetadataProps) {
  useEffect(() => {
    if (title && typeof document !== "undefined") {
      document.title = title.includes("Aptos Explorer")
        ? title
        : `${title} | Aptos Explorer`;
    }
  }, [title]);

  return {title, description, image, url};
}

/**
 * PageMetadata component for declarative meta tag management
 */
export function PageMetadata({
  title,
  description,
  image,
  url,
}: PageMetadataProps) {
  const fullTitle = title
    ? title.includes("Aptos Explorer")
      ? title
      : `${title} | Aptos Explorer`
    : "Aptos Explorer";

  return (
    <Helmet>
      <title>{fullTitle}</title>
      {description && <meta name="description" content={description} />}
      {title && <meta property="og:title" content={fullTitle} />}
      {description && <meta property="og:description" content={description} />}
      {image && <meta property="og:image" content={image} />}
      {url && <meta property="og:url" content={url} />}
      {title && <meta name="twitter:title" content={fullTitle} />}
      {description && <meta name="twitter:description" content={description} />}
      {image && <meta name="twitter:image" content={image} />}
    </Helmet>
  );
}
