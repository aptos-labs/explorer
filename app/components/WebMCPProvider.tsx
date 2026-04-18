import {useEffect} from "react";
import {useNavigate} from "../routing";
import {buildWebMcpTools, type WebMCPTool} from "./webMcpTools";

/**
 * WebMCP tool provider.
 *
 * Registers a small set of navigation "tools" on `navigator.modelContext` so
 * that browser-resident AI agents (see WebMCP draft —
 * https://webmachinelearning.github.io/webmcp/) can open Aptos Explorer
 * pages without scraping the DOM. All tools are read-only navigation
 * helpers: they move the user around inside the explorer but never sign
 * transactions or mutate chain state.
 *
 * Tools are registered once per tab via an `AbortController` that is
 * triggered on unmount, matching the spec's `options.signal` shape.
 *
 * No-op when `navigator.modelContext` is absent (non-supporting browsers,
 * SSR). Errors during registration are logged in dev but never thrown —
 * WebMCP is strictly additive.
 */

type RegisterToolOptions = {signal?: AbortSignal};

type WebMCP = {
  registerTool: (tool: WebMCPTool, options?: RegisterToolOptions) => void;
};

function getModelContext(): WebMCP | null {
  if (typeof navigator === "undefined") return null;
  const mc = (navigator as unknown as {modelContext?: WebMCP}).modelContext;
  return mc && typeof mc.registerTool === "function" ? mc : null;
}

export function WebMCPProvider(): null {
  const navigate = useNavigate();

  useEffect(() => {
    const mc = getModelContext();
    if (!mc) return;

    const controller = new AbortController();
    const {signal} = controller;

    const tools = buildWebMcpTools(async (options) => {
      // Cast to unknown: tanstack-router's useNavigate type depends on the
      // current route, but the paths we emit are plain strings.
      await (navigate as unknown as (o: unknown) => Promise<void> | void)(
        options,
      );
    });

    for (const tool of tools) {
      try {
        mc.registerTool(tool, {signal});
      } catch (err) {
        if (
          typeof process !== "undefined" &&
          process.env?.NODE_ENV === "development"
        ) {
          console.warn(`[WebMCP] failed to register ${tool.name}`, err);
        }
      }
    }

    return () => controller.abort();
  }, [navigate]);

  return null;
}
