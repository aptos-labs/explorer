import {useTheme} from "@mui/material";
import {type RefObject, useLayoutEffect, useRef, useState} from "react";
import {
  desktopToolbarNeedsCompact,
  FALLBACK_DESKTOP_ACTIONS_WIDTH_PX,
  readColumnGap,
  stripAtMedia,
  sumFlexItemWidths,
} from "./headerOverflow";

/**
 * Compact header from overflow only: at `lg+`, when the desktop toolbar's
 * intrinsic width (translated nav labels, network, language, actions) does
 * not fit. Below `lg`, CSS media queries own compact chrome — this hook
 * returns false so SSR/first paint never flash a JS-driven hamburger.
 */
export function useCompactHeader({
  toolbarRef,
  brandRef,
  navRef,
  networkRef,
  languageRef,
  shareRef,
  desktopActionsRef,
  fallbackTrailingWidth = FALLBACK_DESKTOP_ACTIONS_WIDTH_PX,
  remeasureKey,
}: {
  toolbarRef: RefObject<HTMLElement | null>;
  brandRef: RefObject<HTMLElement | null>;
  navRef: RefObject<HTMLElement | null>;
  networkRef: RefObject<HTMLElement | null>;
  languageRef: RefObject<HTMLElement | null>;
  shareRef: RefObject<HTMLElement | null>;
  desktopActionsRef: RefObject<HTMLElement | null>;
  fallbackTrailingWidth?: number;
  remeasureKey: string;
}): boolean {
  const theme = useTheme();
  const [overflowCompact, setOverflowCompact] = useState(false);
  const cachedTrailingWidthRef = useRef(fallbackTrailingWidth);
  const lgUpQuery = stripAtMedia(theme.breakpoints.up("lg"));

  useLayoutEffect(() => {
    const toolbar = toolbarRef.current;
    if (!toolbar || typeof window.matchMedia !== "function") {
      return;
    }

    const mql = window.matchMedia(lgUpQuery);

    const update = () => {
      if (!mql.matches) {
        setOverflowCompact(false);
        return;
      }

      const actions = desktopActionsRef.current;
      if (actions && actions.offsetWidth > 0) {
        cachedTrailingWidthRef.current = actions.offsetWidth;
      }
      const availableWidth = toolbar.clientWidth;
      const intrinsicWidth = sumFlexItemWidths(
        [
          brandRef.current?.offsetWidth ?? 0,
          navRef.current?.offsetWidth ?? 0,
          networkRef.current?.offsetWidth ?? 0,
          languageRef.current?.offsetWidth ?? 0,
          shareRef.current?.offsetWidth ?? 0,
          actions?.offsetWidth || cachedTrailingWidthRef.current,
        ],
        readColumnGap(toolbar),
      );
      setOverflowCompact((currentlyCompact) =>
        desktopToolbarNeedsCompact({
          availableWidth,
          intrinsicWidth,
          currentlyCompact,
        }),
      );
    };

    update();

    const nodes = [
      toolbar,
      brandRef.current,
      navRef.current,
      networkRef.current,
      languageRef.current,
      shareRef.current,
      desktopActionsRef.current,
    ].filter((node): node is HTMLElement => node != null);

    mql.addEventListener("change", update);

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", update);
      return () => {
        mql.removeEventListener("change", update);
        window.removeEventListener("resize", update);
      };
    }

    const observer = new ResizeObserver(update);
    for (const node of nodes) {
      observer.observe(node);
    }
    return () => {
      mql.removeEventListener("change", update);
      observer.disconnect();
    };
  }, [
    brandRef,
    desktopActionsRef,
    languageRef,
    lgUpQuery,
    navRef,
    networkRef,
    remeasureKey,
    shareRef,
    toolbarRef,
  ]);

  return overflowCompact;
}
