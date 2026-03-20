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
// Universal import pattern for ESM/CJS compatibility
import * as ReactHelmetAsync from "react-helmet-async";

const Helmet = ((ReactHelmetAsync as {Helmet?: typeof ReactHelmetAsync.Helmet})
  .Helmet ??
  (ReactHelmetAsync as {default?: typeof ReactHelmetAsync}).default
    ?.Helmet) as typeof ReactHelmetAsync.Helmet;

import {BASE_URL, DEFAULT_OG_IMAGE} from "../../lib/constants";

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
  | "object"
  | "token"
  | "coin"
  | "fungible_asset"
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
  /** When set with home (`/`) `website` metadata, JSON-LD `WebPage.about` carries the active search query (align with `?search=`). */
  searchQuery?: string;
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
 * Generate BreadcrumbList schema from canonical URL path segments.
 * E.g., /account/0x1/transactions → [Explorer, Account 0x1, Transactions]
 */
function generateBreadcrumbList(
  canonicalUrl: string,
): StructuredDataProps | null {
  const url = new URL(canonicalUrl);
  const segments = url.pathname.split("/").filter(Boolean);
  if (segments.length === 0) return null;

  const items = [
    {
      "@type": "ListItem",
      position: 1,
      name: "Explorer",
      item: BASE_URL,
    },
  ];

  let currentPath = "";
  for (let i = 0; i < segments.length; i++) {
    currentPath += `/${segments[i]}`;
    const raw = decodeURIComponent(segments[i]);
    // Truncate long hex addresses for display
    const name =
      raw.startsWith("0x") && raw.length > 10
        ? `${raw.slice(0, 6)}…${raw.slice(-4)}`
        : raw.charAt(0).toUpperCase() + raw.slice(1).replace(/[_-]/g, " ");
    items.push({
      "@type": "ListItem",
      position: i + 2,
      name,
      item: `${BASE_URL}${currentPath}`,
    });
  }

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items,
  };
}

function pathnameFromCanonicalUrl(canonicalUrl: string): string {
  try {
    return new URL(canonicalUrl).pathname;
  } catch {
    return "";
  }
}

function decodePathSegment(segment: string): string {
  try {
    return decodeURIComponent(segment);
  } catch {
    return segment;
  }
}

/** Move type segment between `/coin/` and optional `/{tab}` (supports URL-encoded `::`). */
function entityIdFromCoinPath(pathname: string): string | undefined {
  const m = /^\/coin\/([^/]+)(?:\/[^/]+)?\/?$/.exec(pathname);
  return m ? decodePathSegment(m[1]) : undefined;
}

/** FA metadata address between `/fungible_asset/` and optional tab. */
function entityIdFromFungibleAssetPath(pathname: string): string | undefined {
  const m = /^\/fungible_asset\/([^/]+)(?:\/[^/]+)?\/?$/.exec(pathname);
  return m ? decodePathSegment(m[1]) : undefined;
}

/** Token id between `/token/` and optional tab (supports encoded ids). */
function entityIdFromTokenPath(pathname: string): string | undefined {
  const m = /^\/token\/([^/]+)(?:\/[^/]+)?\/?$/.exec(pathname);
  return m ? decodePathSegment(m[1]) : undefined;
}

/** Human-readable hub title for `/validators/{tab}` JSON-LD. */
function validatorsHubCollectionName(tab: string): string {
  switch (tab) {
    case "delegation":
      return "Delegation Nodes";
    case "enhanced_delegation":
      return "Enhanced Delegation";
    case "all":
      return "Validators";
    default:
      return "Validators";
  }
}

/** CollectionPage for major list hubs (type `website` + path match). */
function hubCollectionPageSchema(
  pathname: string,
  canonicalUrl: string,
  description: string | undefined,
): StructuredDataProps | null {
  const normalized = pathname.replace(/\/$/, "") || "/";

  const validatorsMatch = /^\/validators\/([^/]+)$/.exec(normalized);
  if (validatorsMatch) {
    const tab = validatorsMatch[1];
    const name = validatorsHubCollectionName(tab);
    return {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name,
      headline: name,
      url: canonicalUrl,
      description,
      isPartOf: {
        "@type": "WebSite",
        name: SITE_NAME,
        url: BASE_URL,
      },
    };
  }

  const hubs: Record<string, {name: string}> = {
    "/transactions": {name: "Transactions"},
    "/blocks": {name: "Latest Blocks"},
    "/coins": {name: "Coins & Fungible Assets"},
    "/analytics": {name: "Network Analytics"},
  };
  const config = hubs[normalized];
  if (!config) return null;
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: config.name,
    headline: config.name,
    url: canonicalUrl,
    description,
    isPartOf: {
      "@type": "WebSite",
      name: SITE_NAME,
      url: BASE_URL,
    },
  };
}

/**
 * Generate JSON-LD structured data for the page (exported for unit tests).
 */
export function generateStructuredData(
  props: PageMetadataProps,
  fullTitle: string,
  canonicalUrl: string,
): StructuredDataProps[] {
  const structuredDataItems: StructuredDataProps[] = [];

  // WebSite schema for the main site — includes SearchAction so search engines
  // and AI tools know the site has a search feature
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
        urlTemplate: `${BASE_URL}/?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  // WebPage schema for the current page
  const homePath = pathnameFromCanonicalUrl(canonicalUrl);
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

  const trimmedSearch = props.searchQuery?.trim();
  if (
    props.type === "website" &&
    trimmedSearch &&
    (homePath === "/" || homePath === "")
  ) {
    webPageSchema.about = {
      "@type": "Thing",
      name: "Aptos Explorer search",
      description: trimmedSearch,
    };
  }

  structuredDataItems.push(websiteSchema);
  structuredDataItems.push(webPageSchema);

  // BreadcrumbList from URL path
  const breadcrumb = generateBreadcrumbList(canonicalUrl);
  if (breadcrumb) {
    structuredDataItems.push(breadcrumb);
  }

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
        "@type": "DigitalDocument",
        name: fullTitle,
        url: canonicalUrl,
        description: props.description,
        // Identifier from the URL: either a version number or 0x-prefixed hash
        identifier: canonicalUrl.split("/txn/")[1]?.split("/")[0] ?? undefined,
        encodingFormat: "text/html",
        isAccessibleForFree: true,
        publisher: {
          "@type": "Organization",
          name: "Aptos Labs",
          url: "https://aptoslabs.com",
        },
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
          // Identifier is the blockchain address extracted from the canonical URL
          identifier:
            canonicalUrl.split("/account/")[1]?.split("/")[0] ?? undefined,
        },
      });
      break;
    case "object":
      structuredDataItems.push({
        "@context": "https://schema.org",
        "@type": "ProfilePage",
        name: fullTitle,
        url: canonicalUrl,
        description: props.description,
        mainEntity: {
          "@type": "Thing",
          additionalType: "https://schema.org/DefinedTerm",
          name: fullTitle,
          url: canonicalUrl,
          identifier:
            canonicalUrl.split("/object/")[1]?.split("/")[0] ?? undefined,
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
        // Identifier is the block height
        identifier:
          canonicalUrl.split("/block/")[1]?.split("/")[0] ?? undefined,
        isAccessibleForFree: true,
        creator: {
          "@type": "Organization",
          name: "Aptos Labs",
          url: "https://aptoslabs.com",
        },
      });
      break;
    case "token":
      structuredDataItems.push({
        "@context": "https://schema.org",
        "@type": "CreativeWork",
        name: fullTitle,
        url: canonicalUrl,
        description: props.description,
        additionalType: "https://schema.org/DigitalArt",
        identifier: (() => {
          const path = pathnameFromCanonicalUrl(canonicalUrl);
          if (path.startsWith("/object/")) {
            return path.split("/object/")[1]?.split("/")[0];
          }
          return entityIdFromTokenPath(path);
        })(),
        isAccessibleForFree: true,
      });
      break;
    case "coin":
      structuredDataItems.push({
        "@context": "https://schema.org",
        "@type": "FinancialProduct",
        name: fullTitle,
        url: canonicalUrl,
        description: props.description,
        category: "Cryptocurrency",
        identifier: entityIdFromCoinPath(
          pathnameFromCanonicalUrl(canonicalUrl),
        ),
        isAccessibleForFree: true,
        provider: {
          "@type": "Organization",
          name: "Aptos Labs",
          url: "https://aptoslabs.com",
        },
      });
      break;
    case "fungible_asset":
      structuredDataItems.push({
        "@context": "https://schema.org",
        "@type": "FinancialProduct",
        name: fullTitle,
        url: canonicalUrl,
        description: props.description,
        category: "Cryptocurrency",
        identifier: entityIdFromFungibleAssetPath(
          pathnameFromCanonicalUrl(canonicalUrl),
        ),
        isAccessibleForFree: true,
        provider: {
          "@type": "Organization",
          name: "Aptos Labs",
          url: "https://aptoslabs.com",
        },
      });
      break;
    case "validator":
      structuredDataItems.push({
        "@context": "https://schema.org",
        "@type": "Service",
        name: fullTitle,
        url: canonicalUrl,
        description: props.description,
        serviceType: "Blockchain Validation",
        // Validator address: path is /validator/{address} (not /validators/...)
        identifier: /^\/validator\/([^/]+)/.exec(
          pathnameFromCanonicalUrl(canonicalUrl),
        )?.[1],
        provider: {
          "@type": "Organization",
          name: "Aptos Network",
          url: "https://aptoslabs.com",
        },
      });
      break;
    case "article":
      structuredDataItems.push({
        "@context": "https://schema.org",
        "@type": "Article",
        headline: fullTitle,
        name: fullTitle,
        url: canonicalUrl,
        description: props.description,
        author: {
          "@type": "Organization",
          name: "Aptos Labs",
          url: "https://aptoslabs.com",
        },
        publisher: {
          "@type": "Organization",
          name: "Aptos Labs",
          url: "https://aptoslabs.com",
        },
        isAccessibleForFree: true,
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": canonicalUrl,
        },
      });
      break;
    default:
      break;
  }

  if (props.type === "website") {
    const path = pathnameFromCanonicalUrl(canonicalUrl);
    const hub = hubCollectionPageSchema(path, canonicalUrl, props.description);
    if (hub) {
      structuredDataItems.push(hub);
    }
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
    object: ["object", "Move", "on-chain", "resource"],
    token: ["NFT", "token", "digital collectible", "digital asset"],
    coin: ["coin", "fungible token", "cryptocurrency"],
    fungible_asset: ["fungible asset", "FA", "token", "cryptocurrency"],
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
      case "object":
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
      {Array.from(structuredData.entries()).map(([entryIndex, data]) => (
        <script
          key={`${data["@type"]}-${entryIndex}`}
          type="application/ld+json"
        >
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
