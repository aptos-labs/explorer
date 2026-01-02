/**
 * Hook and component for managing page metadata (title, description, etc.)
 * Uses react-helmet-async for SSR-compatible meta tag management
 *
 * Features:
 * - SEO meta tags (title, description, keywords)
 * - Open Graph tags for social sharing (Facebook, LinkedIn)
 * - Twitter Card tags
 * - Canonical URLs
 * - JSON-LD structured data
 */

import {useEffect, useMemo} from "react";
import {Helmet} from "react-helmet-async";

// Base URL for the explorer
const BASE_URL = "https://explorer.aptoslabs.com";
const DEFAULT_OG_IMAGE = `${BASE_URL}/og-image.png`;
const SITE_NAME = "Aptos Explorer";
const TWITTER_HANDLE = "@aptaboratories";

// Page types for OG and structured data
export type PageType =
  | "website"
  | "article"
  | "profile"
  | "transaction"
  | "block"
  | "account"
  | "token"
  | "coin"
  | "validator";

interface PageMetadataProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: PageType;
  keywords?: string[];
  // For dynamic pages (account, transaction, etc.)
  canonicalPath?: string;
  // Structured data properties
  structuredData?: StructuredDataProps;
  // Disable indexing for certain pages
  noIndex?: boolean;
}

interface StructuredDataProps {
  "@type": string;
  name?: string;
  description?: string;
  url?: string;
  identifier?: string;
  dateCreated?: string;
  dateModified?: string;
  [key: string]: unknown;
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
      document.title = title.includes(SITE_NAME)
        ? title
        : `${title} | ${SITE_NAME}`;
    }
  }, [title]);

  return {title, description, image, url};
}

/**
 * Generate JSON-LD structured data for the page
 */
function generateStructuredData(
  props: PageMetadataProps,
  fullTitle: string,
  canonicalUrl: string,
): StructuredDataProps[] {
  const structuredDataItems: StructuredDataProps[] = [];

  // WebSite schema for the main site
  const websiteSchema: StructuredDataProps = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: BASE_URL,
    description:
      "Explore transactions, accounts, blocks, and activity on the Aptos blockchain.",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${BASE_URL}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  // WebPage schema for the current page
  const webPageSchema: StructuredDataProps = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: fullTitle,
    url: canonicalUrl,
    description: props.description,
    isPartOf: {
      "@type": "WebSite",
      url: BASE_URL,
      name: SITE_NAME,
    },
  };

  structuredDataItems.push(websiteSchema);
  structuredDataItems.push(webPageSchema);

  // Add custom structured data if provided
  if (props.structuredData) {
    structuredDataItems.push({
      "@context": "https://schema.org",
      ...props.structuredData,
    });
  }

  // Add page-type specific schemas
  switch (props.type) {
    case "transaction":
      structuredDataItems.push({
        "@context": "https://schema.org",
        "@type": "Action",
        name: fullTitle,
        url: canonicalUrl,
        description: props.description,
        actionStatus: "CompletedActionStatus",
      });
      break;
    case "account":
    case "profile":
      structuredDataItems.push({
        "@context": "https://schema.org",
        "@type": "ProfilePage",
        name: fullTitle,
        url: canonicalUrl,
        description: props.description,
        mainEntity: {
          "@type": "Thing",
          name: fullTitle,
          url: canonicalUrl,
        },
      });
      break;
    case "block":
      structuredDataItems.push({
        "@context": "https://schema.org",
        "@type": "Dataset",
        name: fullTitle,
        url: canonicalUrl,
        description: props.description,
      });
      break;
    default:
      break;
  }

  return structuredDataItems;
}

/**
 * Get page-specific OG image based on page type
 */
function getOgImage(props: PageMetadataProps): string {
  // If a custom image is provided, use it
  if (props.image) {
    return props.image.startsWith("http")
      ? props.image
      : `${BASE_URL}${props.image}`;
  }

  // For now, use the default OG image
  // TODO: Implement dynamic OG image generation for different page types
  // e.g., /api/og?type=account&address=0x1 for serverless OG image generation
  return DEFAULT_OG_IMAGE;
}

/**
 * Get default keywords based on page type
 */
function getKeywords(props: PageMetadataProps): string {
  const baseKeywords = [
    "Aptos",
    "blockchain",
    "explorer",
    "web3",
    "crypto",
    "decentralized",
  ];

  const typeKeywords: Record<PageType, string[]> = {
    website: ["blockchain explorer", "transactions", "accounts"],
    article: ["blockchain news", "Aptos updates"],
    profile: ["account", "wallet", "portfolio"],
    transaction: ["transaction", "transfer", "tx", "hash"],
    block: ["block", "height", "timestamp", "epoch"],
    account: ["account", "address", "balance", "tokens", "NFTs"],
    token: ["NFT", "token", "digital collectible", "digital asset"],
    coin: ["coin", "fungible token", "cryptocurrency"],
    validator: ["validator", "staking", "delegation", "APT"],
  };

  const keywords = [
    ...baseKeywords,
    ...(props.keywords || []),
    ...(props.type ? typeKeywords[props.type] : []),
  ];

  return keywords.join(", ");
}

/**
 * PageMetadata component for declarative meta tag management
 * Includes SEO meta tags, Open Graph, Twitter Cards, and JSON-LD
 */
export function PageMetadata(props: PageMetadataProps) {
  const {
    title,
    description,
    url,
    type = "website",
    canonicalPath,
    noIndex = false,
  } = props;

  const fullTitle = useMemo(() => {
    if (!title) return SITE_NAME;
    return title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;
  }, [title]);

  const canonicalUrl = useMemo(() => {
    if (url) return url;
    if (canonicalPath) return `${BASE_URL}${canonicalPath}`;
    if (typeof window !== "undefined") {
      // Use the current path without search params for canonical
      return `${BASE_URL}${window.location.pathname}`;
    }
    return BASE_URL;
  }, [url, canonicalPath]);

  const ogImage = useMemo(() => getOgImage(props), [props]);
  const keywords = useMemo(() => getKeywords(props), [props]);

  const structuredData = useMemo(
    () => generateStructuredData(props, fullTitle, canonicalUrl),
    [props, fullTitle, canonicalUrl],
  );

  // Map page type to OG type
  const ogType = useMemo(() => {
    switch (type) {
      case "profile":
      case "account":
        return "profile";
      case "article":
        return "article";
      default:
        return "website";
    }
  }, [type]);

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      {description && <meta name="description" content={description} />}
      {keywords && <meta name="keywords" content={keywords} />}
      <meta name="author" content="Aptos Labs" />

      {/* Canonical URL */}
      <link rel="canonical" href={canonicalUrl} />

      {/* Robots */}
      {noIndex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow" />
      )}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={fullTitle} />
      {description && <meta property="og:description" content={description} />}
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={fullTitle} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:locale" content="en_US" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={TWITTER_HANDLE} />
      <meta name="twitter:creator" content={TWITTER_HANDLE} />
      <meta name="twitter:title" content={fullTitle} />
      {description && <meta name="twitter:description" content={description} />}
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:image:alt" content={fullTitle} />

      {/* JSON-LD Structured Data */}
      {structuredData.map((data, index) => (
        <script key={index} type="application/ld+json">
          {JSON.stringify(data)}
        </script>
      ))}
    </Helmet>
  );
}

/**
 * Default metadata for pages that don't set their own
 */
export function DefaultPageMetadata() {
  return (
    <PageMetadata
      title="Aptos Explorer"
      description="Explore transactions, accounts, blocks, validators, and activity on the Aptos blockchain. The official block explorer for the Aptos network."
      type="website"
    />
  );
}
