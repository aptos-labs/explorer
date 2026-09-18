import {useEffect, useRef, useState} from "react";

/** Viewport band below the sticky header used to pick the current section. */
const GUIDE_SECTION_ROOT_MARGIN = "-112px 0px -55% 0px";

export function pickActiveGuideSection(
  sectionIds: readonly string[],
  ratios: ReadonlyMap<string, number>,
): string {
  let activeId = sectionIds[0] ?? "";
  let bestRatio = -1;

  for (const id of sectionIds) {
    const ratio = ratios.get(id) ?? 0;
    if (ratio > bestRatio) {
      bestRatio = ratio;
      activeId = id;
    }
  }

  return activeId;
}

export function useGuideActiveSection(sectionIds: readonly string[]) {
  const [activeSectionId, setActiveSectionId] = useState(
    () => sectionIds[0] ?? "",
  );
  const ratiosRef = useRef(new Map<string, number>());

  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash && sectionIds.includes(hash)) {
      setActiveSectionId(hash);
    }
  }, [sectionIds]);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") {
      return;
    }

    const syncActiveSection = () => {
      setActiveSectionId(pickActiveGuideSection(sectionIds, ratiosRef.current));
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          ratiosRef.current.set(entry.target.id, entry.intersectionRatio);
        }
        syncActiveSection();
      },
      {
        rootMargin: GUIDE_SECTION_ROOT_MARGIN,
        threshold: [0, 0.1, 0.25, 0.5, 0.75, 1],
      },
    );

    for (const id of sectionIds) {
      const element = document.getElementById(id);
      if (element) {
        observer.observe(element);
      }
    }

    const onHashChange = () => {
      const hash = window.location.hash.slice(1);
      if (hash && sectionIds.includes(hash)) {
        setActiveSectionId(hash);
      }
    };

    window.addEventListener("hashchange", onHashChange);

    return () => {
      observer.disconnect();
      window.removeEventListener("hashchange", onHashChange);
      ratiosRef.current.clear();
    };
  }, [sectionIds]);

  return activeSectionId;
}
