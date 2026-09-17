// @vitest-environment jsdom
// Covers FEAT-GUIDE-001 — guide TOC highlights the section in view
import {act, renderHook} from "@testing-library/react";
import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";
import {
  pickActiveGuideSection,
  useGuideActiveSection,
} from "./useGuideActiveSection";

const SECTION_IDS = ["overview", "search", "networks"] as const;

type ObserverCallback = IntersectionObserverCallback;

class FakeIntersectionObserver {
  static instances: FakeIntersectionObserver[] = [];
  callback: ObserverCallback;
  options?: IntersectionObserverInit;
  observed: Element[] = [];

  constructor(callback: ObserverCallback, options?: IntersectionObserverInit) {
    this.callback = callback;
    this.options = options;
    FakeIntersectionObserver.instances.push(this);
  }

  observe(element: Element) {
    this.observed.push(element);
  }

  unobserve() {}

  takeRecords() {
    return [];
  }

  disconnect() {
    this.observed = [];
  }

  emit(
    entries: Array<{
      target: Element;
      intersectionRatio: number;
      isIntersecting?: boolean;
    }>,
  ) {
    this.callback(
      entries.map((entry) => ({
        boundingClientRect: entry.target.getBoundingClientRect(),
        intersectionRatio: entry.intersectionRatio,
        intersectionRect: entry.target.getBoundingClientRect(),
        isIntersecting: entry.isIntersecting ?? entry.intersectionRatio > 0,
        rootBounds: null,
        target: entry.target,
        time: Date.now(),
      })),
      this as unknown as IntersectionObserver,
    );
  }
}

function mountSectionElements(ids: readonly string[]) {
  document.body.replaceChildren();
  for (const id of ids) {
    const element = document.createElement("section");
    element.id = id;
    document.body.appendChild(element);
  }
}

beforeEach(() => {
  FakeIntersectionObserver.instances = [];
  vi.stubGlobal("IntersectionObserver", FakeIntersectionObserver);
  mountSectionElements(SECTION_IDS);
  window.location.hash = "";
});

afterEach(() => {
  vi.unstubAllGlobals();
  document.body.replaceChildren();
  window.location.hash = "";
});

describe("pickActiveGuideSection", () => {
  it("returns the section with the highest intersection ratio", () => {
    const ratios = new Map<string, number>([
      ["overview", 0],
      ["search", 0.6],
      ["networks", 0.2],
    ]);

    expect(pickActiveGuideSection(SECTION_IDS, ratios)).toBe("search");
  });

  it("falls back to the first section when nothing is intersecting", () => {
    const ratios = new Map<string, number>([
      ["overview", 0],
      ["search", 0],
      ["networks", 0],
    ]);

    expect(pickActiveGuideSection(SECTION_IDS, ratios)).toBe("overview");
  });
});

describe("useGuideActiveSection", () => {
  it("starts on the first section", () => {
    const {result} = renderHook(() => useGuideActiveSection(SECTION_IDS));
    expect(result.current).toBe("overview");
  });

  it("honors the URL hash on mount", () => {
    window.location.hash = "#search";

    const {result} = renderHook(() => useGuideActiveSection(SECTION_IDS));

    expect(result.current).toBe("search");
  });

  it("updates when intersection ratios change", () => {
    const {result} = renderHook(() => useGuideActiveSection(SECTION_IDS));
    const observer = FakeIntersectionObserver.instances[0];
    expect(observer).toBeTruthy();

    act(() => {
      observer.emit([
        {
          target: document.getElementById("overview")!,
          intersectionRatio: 0.1,
        },
        {
          target: document.getElementById("search")!,
          intersectionRatio: 0.75,
        },
        {
          target: document.getElementById("networks")!,
          intersectionRatio: 0.2,
        },
      ]);
    });

    expect(result.current).toBe("search");
  });

  it("updates on hashchange", () => {
    const {result} = renderHook(() => useGuideActiveSection(SECTION_IDS));

    act(() => {
      window.location.hash = "#networks";
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    });

    expect(result.current).toBe("networks");
  });

  it("disconnects the observer on unmount", () => {
    const {unmount} = renderHook(() => useGuideActiveSection(SECTION_IDS));
    const observer = FakeIntersectionObserver.instances[0];
    const disconnectSpy = vi.spyOn(observer, "disconnect");

    unmount();

    expect(disconnectSpy).toHaveBeenCalled();
  });
});
