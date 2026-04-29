const ENTITY_MAP: Record<string, string> = {
  amp: "&",
  apos: "'",
  gt: ">",
  lt: "<",
  nbsp: " ",
  quot: '"',
};

const BLOCK_TAGS = new Set([
  "article",
  "aside",
  "blockquote",
  "body",
  "dd",
  "div",
  "dl",
  "dt",
  "fieldset",
  "figcaption",
  "figure",
  "footer",
  "form",
  "header",
  "hr",
  "main",
  "nav",
  "p",
  "section",
]);

const RAW_TEXT_TAGS = new Set(["script", "style", "noscript", "svg"]);

type HtmlToken =
  | {type: "text"; value: string}
  | {
      attrs: Record<string, string>;
      closing: boolean;
      name: string;
      type: "tag";
    };

type RenderContext =
  | {buffer: string; href?: string; tag: "a"}
  | {buffer: string; tag: "code" | "li" | "pre"}
  | {buffer: string; level: number; tag: "heading"};

function decodeHtmlEntities(value: string): string {
  return value.replace(/&(#x?[0-9a-f]+|[a-z][a-z0-9]+);/gi, (match, entity) => {
    const normalized = entity.toLowerCase();
    if (normalized.startsWith("#x")) {
      const codePoint = Number.parseInt(normalized.slice(2), 16);
      return isValidCodePoint(codePoint)
        ? String.fromCodePoint(codePoint)
        : match;
    }
    if (normalized.startsWith("#")) {
      const codePoint = Number.parseInt(normalized.slice(1), 10);
      return isValidCodePoint(codePoint)
        ? String.fromCodePoint(codePoint)
        : match;
    }
    return ENTITY_MAP[normalized] ?? match;
  });
}

function isValidCodePoint(value: number): boolean {
  return Number.isInteger(value) && value >= 0 && value <= 0x10ffff;
}

function normalizeWhitespace(value: string): string {
  return value
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function isWhitespace(value: string): boolean {
  return value === " " || value === "\n" || value === "\r" || value === "\t";
}

function isNameChar(value: string): boolean {
  const code = value.charCodeAt(0);
  return (
    (code >= 48 && code <= 57) ||
    (code >= 65 && code <= 90) ||
    (code >= 97 && code <= 122) ||
    value === "-" ||
    value === "_" ||
    value === ":"
  );
}

function escapeMarkdownHtml(value: string): string {
  let escaped = "";
  for (const char of value) {
    if (char === "<") {
      escaped += "&lt;";
    } else if (char === ">") {
      escaped += "&gt;";
    } else {
      escaped += char;
    }
  }
  return escaped;
}

function normalizeInline(value: string): string {
  return normalizeWhitespace(value).replace(/[ \t]+/g, " ");
}

function appendText(target: RenderContext[] | {buffer: string}, value: string) {
  if (Array.isArray(target)) {
    const context = target.at(-1);
    if (context) {
      context.buffer += value;
    }
    return;
  }
  target.buffer += value;
}

function readTagEnd(html: string, start: number): number {
  let quote: string | undefined;
  for (let i = start; i < html.length; i += 1) {
    const char = html[i];
    if (quote) {
      if (char === quote) quote = undefined;
      continue;
    }
    if (char === '"' || char === "'") {
      quote = char;
      continue;
    }
    if (char === ">") return i;
  }
  return -1;
}

function readName(value: string, start: number): {end: number; name: string} {
  let end = start;
  while (end < value.length && isNameChar(value[end])) end += 1;
  return {end, name: value.slice(start, end).toLowerCase()};
}

function parseTag(raw: string): HtmlToken | undefined {
  let i = 0;
  while (i < raw.length && isWhitespace(raw[i])) i += 1;
  if (raw[i] === "!" || raw[i] === "?") return undefined;

  const closing = raw[i] === "/";
  if (closing) i += 1;
  while (i < raw.length && isWhitespace(raw[i])) i += 1;

  const {end, name} = readName(raw, i);
  if (!name) return undefined;
  i = end;

  const attrs: Record<string, string> = {};

  while (i < raw.length) {
    while (i < raw.length && isWhitespace(raw[i])) i += 1;
    if (raw[i] === "/") {
      i += 1;
      continue;
    }

    const attr = readName(raw, i);
    if (!attr.name) break;
    i = attr.end;
    while (i < raw.length && isWhitespace(raw[i])) i += 1;

    let value = "";
    if (raw[i] === "=") {
      i += 1;
      while (i < raw.length && isWhitespace(raw[i])) i += 1;
      const quote = raw[i] === '"' || raw[i] === "'" ? raw[i] : undefined;
      if (quote) i += 1;
      const valueStart = i;
      if (quote) {
        while (i < raw.length && raw[i] !== quote) i += 1;
        value = raw.slice(valueStart, i);
        if (raw[i] === quote) i += 1;
      } else {
        while (i < raw.length && !isWhitespace(raw[i]) && raw[i] !== "/") {
          i += 1;
        }
        value = raw.slice(valueStart, i);
      }
    }

    attrs[attr.name] = decodeHtmlEntities(value).trim();
  }

  return {attrs, closing, name, type: "tag"};
}

function tokenizeHtml(html: string): HtmlToken[] {
  const tokens: HtmlToken[] = [];
  let i = 0;

  while (i < html.length) {
    const tagStart = html.indexOf("<", i);
    if (tagStart === -1) {
      tokens.push({type: "text", value: html.slice(i)});
      break;
    }
    if (tagStart > i)
      tokens.push({type: "text", value: html.slice(i, tagStart)});

    if (html.startsWith("<!--", tagStart)) {
      const commentEnd = html.indexOf("-->", tagStart + 4);
      i = commentEnd === -1 ? html.length : commentEnd + 3;
      continue;
    }

    const tagEnd = readTagEnd(html, tagStart + 1);
    if (tagEnd === -1) {
      tokens.push({type: "text", value: html.slice(tagStart)});
      break;
    }

    const tag = parseTag(html.slice(tagStart + 1, tagEnd));
    if (!tag) {
      i = tagEnd + 1;
      continue;
    }
    tokens.push(tag);
    i = tagEnd + 1;

    if (tag.type === "tag" && !tag.closing && RAW_TEXT_TAGS.has(tag.name)) {
      const closeNeedle = `</${tag.name}`;
      const rawCloseStart = html.toLowerCase().indexOf(closeNeedle, i);
      if (rawCloseStart === -1) {
        i = html.length;
        continue;
      }
      const rawCloseEnd = readTagEnd(html, rawCloseStart + 1);
      i = rawCloseEnd === -1 ? html.length : rawCloseEnd + 1;
    }
  }

  return tokens;
}

function tokensInside(
  tokens: HtmlToken[],
  tagName: string,
  fallback: HtmlToken[] = [],
): HtmlToken[] {
  const start = tokens.findIndex(
    (token) => token.type === "tag" && !token.closing && token.name === tagName,
  );
  if (start === -1) return fallback;

  let depth = 0;
  for (let i = start; i < tokens.length; i += 1) {
    const token = tokens[i];
    if (token.type !== "tag" || token.name !== tagName) continue;
    if (!token.closing) depth += 1;
    if (token.closing) depth -= 1;
    if (depth === 0) return tokens.slice(start + 1, i);
  }

  return tokens.slice(start + 1);
}

function textContent(tokens: HtmlToken[]): string {
  let text = "";
  for (const token of tokens) {
    if (token.type === "text") text += decodeHtmlEntities(token.value);
  }
  return normalizeInline(escapeMarkdownHtml(text));
}

function renderContext(context: RenderContext): string {
  if (context.tag === "heading") {
    const text = normalizeInline(context.buffer);
    return text ? `\n\n${"#".repeat(context.level)} ${text}\n\n` : "";
  }
  if (context.tag === "a") {
    const text = normalizeInline(context.buffer);
    if (!text) return "";
    const href = context.href?.trim();
    if (
      !href ||
      href.startsWith("#") ||
      href.toLowerCase().startsWith("javascript:")
    ) {
      return text;
    }
    return `[${text}](${href})`;
  }
  if (context.tag === "li") {
    const text = normalizeWhitespace(context.buffer);
    return text ? `\n- ${text}` : "";
  }
  if (context.tag === "code") {
    const text = normalizeInline(context.buffer);
    return text ? `\`${text}\`` : "";
  }

  const text = normalizeWhitespace(context.buffer);
  return text ? `\n\n\`\`\`\n${text}\n\`\`\`\n\n` : "";
}

function closeContext(
  stack: RenderContext[],
  root: {buffer: string},
  predicate: (context: RenderContext) => boolean,
) {
  const context = stack.at(-1);
  if (!context || !predicate(context)) return;
  stack.pop();
  const rendered = renderContext(context);
  if (stack.length > 0) {
    appendText(stack, rendered);
  } else {
    root.buffer += rendered;
  }
}

function renderTokens(tokens: HtmlToken[]): string {
  const root = {buffer: ""};
  const stack: RenderContext[] = [];

  for (const token of tokens) {
    if (token.type === "text") {
      appendText(
        stack.length > 0 ? stack : root,
        escapeMarkdownHtml(decodeHtmlEntities(token.value)),
      );
      continue;
    }

    const level =
      token.name.length === 2 && token.name[0] === "h"
        ? Number(token.name[1])
        : 0;

    if (token.closing) {
      if (level >= 1 && level <= 6) {
        closeContext(stack, root, (context) => context.tag === "heading");
      } else if (token.name === "a") {
        closeContext(stack, root, (context) => context.tag === "a");
      } else if (token.name === "li") {
        closeContext(stack, root, (context) => context.tag === "li");
      } else if (token.name === "code") {
        closeContext(stack, root, (context) => context.tag === "code");
      } else if (token.name === "pre") {
        closeContext(stack, root, (context) => context.tag === "pre");
      }
      continue;
    }

    if (level >= 1 && level <= 6) {
      stack.push({buffer: "", level, tag: "heading"});
    } else if (token.name === "a") {
      stack.push({buffer: "", href: token.attrs.href, tag: "a"});
    } else if (token.name === "li") {
      stack.push({buffer: "", tag: "li"});
    } else if (token.name === "code") {
      stack.push({buffer: "", tag: "code"});
    } else if (token.name === "pre") {
      stack.push({buffer: "", tag: "pre"});
    } else if (token.name === "img") {
      const src = token.attrs.src?.trim();
      if (src)
        appendText(
          stack.length > 0 ? stack : root,
          `![${token.attrs.alt ?? ""}](${src})`,
        );
    } else if (token.name === "br") {
      appendText(stack.length > 0 ? stack : root, "\n");
    } else if (token.name === "ul" || token.name === "ol") {
      appendText(stack.length > 0 ? stack : root, "\n");
    } else if (BLOCK_TAGS.has(token.name)) {
      appendText(stack.length > 0 ? stack : root, "\n\n");
    }
  }

  while (stack.length > 0) {
    const context = stack.pop();
    if (context) root.buffer += renderContext(context);
  }

  return normalizeWhitespace(root.buffer);
}

export function htmlToMarkdown(html: string, sourceUrl?: string): string {
  const tokens = tokenizeHtml(html);
  const title = textContent(tokensInside(tokens, "title"));
  const content = renderTokens(tokensInside(tokens, "body", tokens));
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
