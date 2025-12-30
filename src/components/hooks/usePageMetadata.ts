import React from "react";
import {Helmet} from "react-helmet-async";
import {useLocation} from "react-router-dom";

// Default values
const DEFAULT_DESCRIPTION =
  "Explore transactions, accounts, events, nodes, gas fees and other network activity within the Aptos Network.";
const DEFAULT_OG_IMAGE = "https://explorer.aptoslabs.com/og-image.png";
const BASE_URL = "https://explorer.aptoslabs.com";

export interface PageMetadataArgs {
  title?: string;
  description?: string;
  ogImage?: string;
  /** Set to true to prevent indexing of this page */
  noIndex?: boolean;
}

/**
 * PageMetadata component for SEO - renders Helmet with meta tags
 * This should be rendered in the component tree (not used as a hook)
 */
export function PageMetadata({
  title,
  description,
  ogImage,
  noIndex = false,
}: PageMetadataArgs): React.ReactElement {
  const location = useLocation();

  const fullTitle = title ? `${title} | Aptos Explorer` : "Aptos Explorer";
  const metaDescription = description || DEFAULT_DESCRIPTION;
  const ogImageUrl = ogImage || DEFAULT_OG_IMAGE;

  // Build canonical URL without query params to avoid duplicate content issues
  const canonicalUrl = `${BASE_URL}${location.pathname}`;

  return React.createElement(
    Helmet,
    null,
    // Title
    React.createElement("title", null, fullTitle),

    // Basic meta tags
    React.createElement("meta", {
      name: "description",
      content: metaDescription,
    }),
    noIndex &&
      React.createElement("meta", {name: "robots", content: "noindex"}),

    // Canonical URL
    React.createElement("link", {rel: "canonical", href: canonicalUrl}),

    // Open Graph tags
    React.createElement("meta", {property: "og:title", content: fullTitle}),
    React.createElement("meta", {
      property: "og:description",
      content: metaDescription,
    }),
    React.createElement("meta", {property: "og:url", content: canonicalUrl}),
    React.createElement("meta", {property: "og:image", content: ogImageUrl}),
    React.createElement("meta", {property: "og:type", content: "website"}),
    React.createElement("meta", {
      property: "og:site_name",
      content: "Aptos Explorer",
    }),

    // Twitter Card tags
    React.createElement("meta", {
      name: "twitter:card",
      content: "summary_large_image",
    }),
    React.createElement("meta", {name: "twitter:site", content: "@Aptos"}),
    React.createElement("meta", {name: "twitter:title", content: fullTitle}),
    React.createElement("meta", {
      name: "twitter:description",
      content: metaDescription,
    }),
    React.createElement("meta", {name: "twitter:image", content: ogImageUrl}),
  );
}

/**
 * @deprecated Use PageMetadata component instead for full SEO support
 * Legacy hook for backward compatibility - only updates document.title
 */
export function usePageMetadata(args: PageMetadataArgs = {}): void {
  React.useEffect(() => {
    document.title = args.title
      ? `${args.title} | Aptos Explorer`
      : "Aptos Explorer";
  }, [args.title]);
}
