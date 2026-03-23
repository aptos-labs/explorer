import {tryStandardizeAddress} from "./utils";

export type MoveCodeLinkContext = {
  /** Package / module owner address (same as the account/object page). */
  packageAddress: string;
  isObject: boolean;
};

/** Matches `module::function` or full `0x..::module::function` in Move source. */
export const MOVE_CODE_QUALIFIED_CALL_RE =
  /\b(0x[0-9a-fA-F]+)::([a-zA-Z_][a-zA-Z0-9_]*)::([a-zA-Z_][a-zA-Z0-9_]*)\b|\b([a-zA-Z_][a-zA-Z0-9_]*)::([a-zA-Z_][a-zA-Z0-9_]*)\b/g;

export const MOVE_CODE_FN_LINK_DATA_ATTR = "data-move-fn-link";

function accountSegment(isObject: boolean) {
  return isObject ? "object" : "account";
}

/**
 * Builds the explorer path to the Code tab for a module + function (scroll target).
 */
export function moveModuleFunctionCodePath(
  ctx: MoveCodeLinkContext,
  moduleName: string,
  functionName: string,
  resolvedPackageAddress: string,
): string {
  return `/${accountSegment(ctx.isObject)}/${resolvedPackageAddress}/modules/code/${encodeURIComponent(moduleName)}/${encodeURIComponent(functionName)}`;
}

function pathForRegexMatch(
  m: RegExpExecArray,
  ctx: MoveCodeLinkContext,
): string | null {
  const fullAddr = m[1];
  const moduleName = (fullAddr ? m[2] : m[4]) as string | undefined;
  const functionName = (fullAddr ? m[3] : m[5]) as string | undefined;
  if (!moduleName || !functionName) return null;
  const resolvedAddr = fullAddr
    ? (tryStandardizeAddress(fullAddr) ?? fullAddr)
    : ctx.packageAddress;
  return moveModuleFunctionCodePath(
    ctx,
    moduleName,
    functionName,
    resolvedAddr,
  );
}

/** Resolves a single qualified call string to a code-view path, or null if it does not match. */
export function resolveMoveCodeLinkPath(
  qualifiedText: string,
  ctx: MoveCodeLinkContext,
): string | null {
  const re = new RegExp(`^(?:${MOVE_CODE_QUALIFIED_CALL_RE.source})$`);
  const m = re.exec(qualifiedText);
  if (!m) return null;
  return pathForRegexMatch(m, ctx);
}

type HljsAstNode = {
  type: string;
  value?: string;
  tagName?: string;
  properties?: {
    className?: string[] | string;
    style?: Record<string, string | number>;
    key?: string;
    [key: string]: unknown;
  };
  children?: HljsAstNode[];
};

/**
 * react-syntax-highlighter's createElement assumes `className` is a string[] when
 * `useInlineStyles` is true; missing or malformed values can break SSR/React DOM.
 * Data attributes must be strings or React's attribute stringification can throw
 * (e.g. null-prototype objects → "Cannot convert object to primitive value").
 */
function sanitizeHljsAstForReactDom(nodes: HljsAstNode[]): HljsAstNode[] {
  function visit(node: HljsAstNode): void {
    if (node.type === "element" && node.properties) {
      const p = node.properties;
      const linkVal = p[MOVE_CODE_FN_LINK_DATA_ATTR];
      if (linkVal != null && typeof linkVal !== "string") {
        delete p[MOVE_CODE_FN_LINK_DATA_ATTR];
      }
      const c = p.className;
      if (c == null) {
        p.className = [];
      } else if (typeof c === "string") {
        p.className = c.trim() ? c.trim().split(/\s+/) : [];
      } else if (Array.isArray(c)) {
        p.className = c.filter((x): x is string => typeof x === "string");
      } else {
        p.className = [];
      }
    }
    if (node.children) {
      for (const ch of node.children) {
        visit(ch);
      }
    }
  }
  for (const n of nodes) {
    visit(n);
  }
  return nodes;
}

function splitTextNodeForMoveLinks(
  node: HljsAstNode,
  ctx: MoveCodeLinkContext,
): HljsAstNode {
  const value = node.value;
  if (typeof value !== "string" || !value) {
    return node;
  }

  const re = new RegExp(
    MOVE_CODE_QUALIFIED_CALL_RE.source,
    MOVE_CODE_QUALIFIED_CALL_RE.flags,
  );
  const children: HljsAstNode[] = [];
  let last = 0;
  for (;;) {
    const match = re.exec(value);
    if (match === null) {
      break;
    }
    if (match.index > last) {
      children.push({type: "text", value: value.slice(last, match.index)});
    }
    const path = pathForRegexMatch(match, ctx);
    const linkText = match[0];
    if (path) {
      children.push({
        type: "element",
        tagName: "span",
        properties: {
          className: ["move-code-qualified-link"],
          style: {
            cursor: "pointer",
            textDecoration: "underline",
            textDecorationStyle: "dotted",
            textUnderlineOffset: "2px",
          },
          [MOVE_CODE_FN_LINK_DATA_ATTR]: String(path),
          role: "link",
          tabIndex: 0,
          "aria-label": `Open ${linkText} in module code view`,
        },
        children: [{type: "text", value: linkText}],
      });
    } else {
      children.push({type: "text", value: linkText});
    }
    last = match.index + linkText.length;
  }
  if (last < value.length) {
    children.push({type: "text", value: value.slice(last)});
  }
  if (children.length === 0) {
    return node;
  }
  if (children.length === 1) {
    const [single] = children;
    return single;
  }
  return {
    type: "element",
    tagName: "span",
    properties: {className: []},
    children,
  };
}

function mapHljsAstForMoveLinks(
  node: HljsAstNode,
  ctx: MoveCodeLinkContext,
): HljsAstNode {
  if (node.type === "text") {
    return splitTextNodeForMoveLinks(node, ctx);
  }
  if (node.children?.length) {
    return {
      ...node,
      children: node.children.map((c) => mapHljsAstForMoveLinks(c, ctx)),
    };
  }
  return node;
}

/**
 * Walks react-syntax-highlighter / highlight.js row nodes and wraps
 * `module::function` (and fully qualified) spans with link metadata for click delegation.
 */
export function injectMoveCodeLinksInHighlightRows(
  rows: HljsAstNode[],
  ctx: MoveCodeLinkContext,
): HljsAstNode[] {
  const linked = rows.map((row) => mapHljsAstForMoveLinks(row, ctx));
  return sanitizeHljsAstForReactDom(linked);
}
