import {type RefObject, useLayoutEffect, useRef, useState} from "react";
import {
  desktopToolbarNeedsCompact,
  FALLBACK_DESKTOP_ACTIONS_WIDTH_PX,
  readColumnGap,
  sumFlexItemWidths,
} from "./headerOverflow";

/**
 * Compact header below `lg`, and also at `lg+` when the desktop toolbar's
 * intrinsic width (translated nav labels, network, language, actions)
 * does not fit.
 */
export function useCompactHeader({
  forceCompact,
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
  forceCompact: boolean;
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
  const [overflowCompact, setOverflowCompact] = useState(false);
  const cachedTrailingWidthRef = useRef(fallbackTrailingWidth);

  useLayoutEffect(() => {
    if (forceCompact) {
      setOverflowCompact(false);
      return;
    }

    const toolbar = toolbarRef.current;
    if (!toolbar) {
      return;
    }

    const update = () => {
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

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", update);
      return () => {
        window.removeEventListener("resize", update);
      };
    }

    const observer = new ResizeObserver(update);
    for (const node of nodes) {
      observer.observe(node);
    }
    return () => {
      observer.disconnect();
    };
  }, [
    brandRef,
    desktopActionsRef,
    forceCompact,
    languageRef,
    navRef,
    networkRef,
    remeasureKey,
    shareRef,
    toolbarRef,
  ]);

  return forceCompact || overflowCompact;
}
