export type MessageValue = string | readonly string[] | MessageTree;

export type MessageTree = {
  [key: string]: MessageValue;
};

export type MessageCatalog = {
  locale: string;
  messages: MessageTree;
};

const PLACEHOLDER_RE = /\{(\w+)\}/g;

function isMessageList(value: MessageValue): value is readonly string[] {
  return Array.isArray(value);
}

export function interpolate(
  template: string,
  vars?: Record<string, string | number>,
): string {
  if (!vars) {
    return template;
  }
  return template.replace(PLACEHOLDER_RE, (match, name: string) =>
    Object.hasOwn(vars, name) ? String(vars[name]) : match,
  );
}

export function getMessage(
  tree: MessageTree,
  key: string,
): string | readonly string[] | undefined {
  const parts = key.split(".").filter(Boolean);
  let current: MessageValue | undefined = tree;

  for (const part of parts) {
    if (
      current === undefined ||
      typeof current === "string" ||
      isMessageList(current)
    ) {
      return undefined;
    }
    current = current[part];
  }

  if (typeof current === "string" || isMessageList(current)) {
    return current;
  }
  return undefined;
}

function interpolateValue(
  value: string | readonly string[],
  vars?: Record<string, string | number>,
): string | string[] {
  if (typeof value === "string") {
    return interpolate(value, vars);
  }
  return value.map((item) => interpolate(item, vars));
}

export function translate(
  catalogs: MessageCatalog[],
  key: string,
  vars?: Record<string, string | number>,
): string {
  for (const catalog of catalogs) {
    const value = getMessage(catalog.messages, key);
    if (typeof value === "string") {
      return interpolate(value, vars);
    }
  }
  return key;
}

export function translateList(
  catalogs: MessageCatalog[],
  key: string,
  vars?: Record<string, string | number>,
): string[] {
  for (const catalog of catalogs) {
    const value = getMessage(catalog.messages, key);
    if (value === undefined) {
      continue;
    }
    const interpolated = interpolateValue(value, vars);
    return typeof interpolated === "string" ? [interpolated] : interpolated;
  }
  return [];
}

export function collectMessageKeys(tree: MessageTree, prefix = ""): string[] {
  const keys: string[] = [];
  for (const [part, value] of Object.entries(tree)) {
    const key = prefix ? `${prefix}.${part}` : part;
    if (typeof value === "string" || isMessageList(value)) {
      keys.push(key);
    } else {
      keys.push(...collectMessageKeys(value, key));
    }
  }
  return keys;
}

export function messagePlaceholders(
  value: string | readonly string[],
): string[] {
  const texts = typeof value === "string" ? [value] : [...value];
  const names = new Set<string>();
  for (const text of texts) {
    for (const match of text.matchAll(PLACEHOLDER_RE)) {
      names.add(match[1]);
    }
  }
  return [...names].sort();
}
