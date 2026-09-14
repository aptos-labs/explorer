import {Box, Link as MuiLink} from "@mui/material";
import {Fragment, type ReactNode} from "react";
import {Link} from "../routing";
import {isInternalHref, parseInlineMarkup} from "./inlineMarkup";

const codeSx = {
  fontFamily: "monospace",
  fontSize: "0.9em",
  overflowWrap: "anywhere",
  wordBreak: "break-word",
} as const;

function MarkupLink({href, children}: {href: string; children: ReactNode}) {
  if (href.startsWith("#")) {
    return <MuiLink href={href}>{children}</MuiLink>;
  }

  if (isInternalHref(href)) {
    return <Link to={href}>{children}</Link>;
  }

  return (
    <MuiLink href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </MuiLink>
  );
}

export function InlineMarkup({text}: {text: string}) {
  const nodes = parseInlineMarkup(text);
  return (
    <>
      {nodes.map((node, index) => {
        const key = `${node.type}-${index}`;
        switch (node.type) {
          case "text":
            return <Fragment key={key}>{node.value}</Fragment>;
          case "bold":
            return <strong key={key}>{node.value}</strong>;
          case "code":
            return (
              <Box component="code" key={key} sx={codeSx}>
                {node.value}
              </Box>
            );
          case "link":
            return (
              <MarkupLink key={key} href={node.href}>
                {node.value}
              </MarkupLink>
            );
        }
      })}
    </>
  );
}
