export type InlineMarkupNode =
  | {type: "text"; value: string}
  | {type: "bold"; value: string}
  | {type: "code"; value: string}
  | {type: "link"; href: string; value: string};

const MARKUP_RE = /\*\*([^*]+)\*\*|`([^`]+)`|\[([^\]]+)\]\(([^)]+)\)/g;

export function parseInlineMarkup(input: string): InlineMarkupNode[] {
  const nodes: InlineMarkupNode[] = [];
  let lastIndex = 0;

  for (const match of input.matchAll(MARKUP_RE)) {
    const index = match.index ?? 0;
    if (index > lastIndex) {
      nodes.push({type: "text", value: input.slice(lastIndex, index)});
    }

    if (match[1] !== undefined) {
      nodes.push({type: "bold", value: match[1]});
    } else if (match[2] !== undefined) {
      nodes.push({type: "code", value: match[2]});
    } else if (match[3] !== undefined && match[4] !== undefined) {
      nodes.push({type: "link", href: match[4], value: match[3]});
    }

    lastIndex = index + match[0].length;
  }

  if (lastIndex < input.length) {
    nodes.push({type: "text", value: input.slice(lastIndex)});
  }

  if (nodes.length === 0) {
    return [{type: "text", value: input}];
  }

  return nodes;
}

export function isInternalHref(href: string): boolean {
  if (href.startsWith("#")) {
    return true;
  }
  return href.startsWith("/") && !href.startsWith("//");
}
