const BLOCK_TAGS =
  /<\/?(article|aside|blockquote|body|dd|div|dl|dt|fieldset|figcaption|figure|footer|form|header|hr|main|nav|p|section)[^>]*>/gi;

const ENTITY_MAP: Record<string, string> = {
  amp: "&",
  apos: "'",
  gt: ">",
  lt: "<",
  nbsp: " ",
  quot: '"',
};

function decodeHtmlEntities(value: string): string {
  return value.replace(/&(#x?[0-9a-f]+|[a-z][a-z0-9]+);/gi, (match, entity) => {
    const normalized = entity.toLowerCase();
    if (normalized.startsWith("#x")) {
      const codePoint = Number.parseInt(normalized.slice(2), 16);
      return Number.isFinite(codePoint)
        ? String.fromCodePoint(codePoint)
        : match;
    }
    if (normalized.startsWith("#")) {
      const codePoint = Number.parseInt(normalized.slice(1), 10);
      return Number.isFinite(codePoint)
        ? String.fromCodePoint(codePoint)
        : match;
    }
    return ENTITY_MAP[normalized] ?? match;
  });
}

function normalizeWhitespace(value: string): string {
  return value
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function stripTags(value: string): string {
  return decodeHtmlEntities(value.replace(/<[^>]*>/g, ""))
    .replace(/[ \t]+/g, " ")
    .trim();
}

function getAttribute(tag: string, attribute: string): string | undefined {
  const pattern = new RegExp(
    `${attribute}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`,
    "i",
  );
  const match = tag.match(pattern);
  const value = match?.[1] ?? match?.[2] ?? match?.[3];
  return value ? decodeHtmlEntities(value).trim() : undefined;
}

function convertLinks(value: string): string {
  return value.replace(
    /<a\b([^>]*)>([\s\S]*?)<\/a>/gi,
    (_match, attrs, label) => {
      const href = getAttribute(attrs, "href");
      const text = stripTags(label);
      if (!text) return "";
      if (!href || href.startsWith("#") || /^javascript:/i.test(href))
        return text;
      return `[${text}](${href})`;
    },
  );
}

function convertImages(value: string): string {
  return value.replace(/<img\b([^>]*)>/gi, (_match, attrs) => {
    const src = getAttribute(attrs, "src");
    if (!src) return "";
    const alt = getAttribute(attrs, "alt") ?? "";
    return `![${alt}](${src})`;
  });
}

function convertPreBlocks(value: string): string {
  return value.replace(/<pre\b[^>]*>([\s\S]*?)<\/pre>/gi, (_match, code) => {
    const text = stripTags(code);
    return text ? `\n\n\`\`\`\n${text}\n\`\`\`\n\n` : "";
  });
}

function convertHeadings(value: string): string {
  return value.replace(
    /<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1>/gi,
    (_match, level, text) => {
      const heading = stripTags(text);
      return heading ? `\n\n${"#".repeat(Number(level))} ${heading}\n\n` : "";
    },
  );
}

function convertLists(value: string): string {
  return value
    .replace(/<li\b[^>]*>([\s\S]*?)<\/li>/gi, (_match, item) => {
      const text = normalizeWhitespace(stripTags(item));
      return text ? `\n- ${text}` : "";
    })
    .replace(/<\/?(ul|ol)\b[^>]*>/gi, "\n");
}

function convertInlineCode(value: string): string {
  return value.replace(/<code\b[^>]*>([\s\S]*?)<\/code>/gi, (_match, code) => {
    const text = stripTags(code);
    return text ? `\`${text}\`` : "";
  });
}

function extractTitle(html: string): string | undefined {
  const title = html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1];
  return title ? stripTags(title) : undefined;
}

function extractBody(html: string): string {
  return html.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i)?.[1] ?? html;
}

export function htmlToMarkdown(html: string, sourceUrl?: string): string {
  const title = extractTitle(html);
  let markdown = extractBody(html)
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<(script|style|noscript|svg)\b[\s\S]*?<\/\1>/gi, "")
    .replace(/<!doctype[^>]*>/gi, "");

  markdown = convertPreBlocks(markdown);
  markdown = convertHeadings(markdown);
  markdown = convertLinks(markdown);
  markdown = convertImages(markdown);
  markdown = convertInlineCode(markdown);
  markdown = convertLists(markdown);
  markdown = markdown
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(BLOCK_TAGS, "\n\n")
    .replace(/<[^>]*>/g, "");

  const content = normalizeWhitespace(decodeHtmlEntities(markdown));
  const heading = [
    title ? `# ${title}` : undefined,
    sourceUrl ? `Source: ${sourceUrl}` : undefined,
  ]
    .filter(Boolean)
    .join("\n\n");

  return normalizeWhitespace([heading, content].filter(Boolean).join("\n\n"));
}

export function estimateMarkdownTokens(markdown: string): number {
  const trimmed = markdown.trim();
  if (!trimmed) return 0;
  return Math.max(1, Math.ceil(trimmed.length / 4));
}
