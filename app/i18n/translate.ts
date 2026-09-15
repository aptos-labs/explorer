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
