import {describe, expect, it} from "vitest";
import {brandColors, getSemanticColors} from "./aptosBrandColors";

function hexToRgb(hex: string) {
  const h = hex.replace("#", "");
  const n =
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h;
  return {
    r: Number.parseInt(n.slice(0, 2), 16) / 255,
    g: Number.parseInt(n.slice(2, 4), 16) / 255,
    b: Number.parseInt(n.slice(4, 6), 16) / 255,
  };
}

function relativeLuminance(hex: string) {
  const {r, g, b} = hexToRgb(hex);
  const f = (c: number) =>
    c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

/** WCAG 2.1 contrast ratio (1–21). */
function contrastRatio(fg: string, bg: string) {
  const L1 = relativeLuminance(fg);
  const L2 = relativeLuminance(bg);
  const lighter = Math.max(L1, L2);
  const darker = Math.min(L1, L2);
  return (lighter + 0.05) / (darker + 0.05);
}

function compositeHex(fg: string, fgAlpha: number, bg: string) {
  const f = hexToRgb(fg);
  const b = hexToRgb(bg);
  const blend = (fc: number, bc: number) => fc * fgAlpha + bc * (1 - fgAlpha);
  const toByte = (x: number) =>
    Math.round(Math.min(1, Math.max(0, x)) * 255)
      .toString(16)
      .padStart(2, "0");
  return `#${toByte(blend(f.r, b.r))}${toByte(blend(f.g, b.g))}${toByte(blend(f.b, b.b))}`;
}

describe("aptosBrandColors accessibility (WCAG 2.1 AA text ≥4.5:1)", () => {
  for (const mode of ["light", "dark"] as const) {
    const s = getSemanticColors(mode);
    const bgDefault = s.background.default;
    const bgPaper = s.background.paper;

    it(`${mode}: primary text on surfaces`, () => {
      expect(contrastRatio(s.text.primary, bgDefault)).toBeGreaterThanOrEqual(
        4.5,
      );
      expect(contrastRatio(s.text.primary, bgPaper)).toBeGreaterThanOrEqual(
        4.5,
      );
      expect(contrastRatio(s.text.secondary, bgDefault)).toBeGreaterThanOrEqual(
        4.5,
      );
      expect(contrastRatio(s.text.secondary, bgPaper)).toBeGreaterThanOrEqual(
        4.5,
      );
      expect(contrastRatio(s.text.disabled, bgDefault)).toBeGreaterThanOrEqual(
        4.5,
      );
      expect(contrastRatio(s.text.disabled, bgPaper)).toBeGreaterThanOrEqual(
        4.5,
      );
    });

    it(`${mode}: links & status hues on surfaces`, () => {
      expect(contrastRatio(s.link.main, bgDefault)).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(s.link.main, bgPaper)).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(s.link.hover, bgDefault)).toBeGreaterThanOrEqual(
        4.5,
      );
      expect(contrastRatio(s.status.success, bgDefault)).toBeGreaterThanOrEqual(
        4.5,
      );
      expect(contrastRatio(s.status.error, bgDefault)).toBeGreaterThanOrEqual(
        4.5,
      );
      expect(contrastRatio(s.status.warning, bgDefault)).toBeGreaterThanOrEqual(
        4.5,
      );
      expect(contrastRatio(s.status.info, bgDefault)).toBeGreaterThanOrEqual(
        4.5,
      );
    });

    it(`${mode}: JSON key on paper`, () => {
      expect(contrastRatio(s.jsonView.key, bgPaper)).toBeGreaterThanOrEqual(
        4.5,
      );
    });

    it(`${mode}: code block text on tinted panel`, () => {
      const panelBg = compositeHex(
        brandColors.babyBlue,
        mode === "dark" ? 0.15 : 0.08,
        bgDefault,
      );
      expect(
        contrastRatio(s.codeBlock.textSecondary, panelBg),
      ).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(s.codeBlock.text, panelBg)).toBeGreaterThanOrEqual(
        4.5,
      );
    });

    it(`${mode}: primary filled button label on primary`, () => {
      const btnFg = mode === "dark" ? brandColors.black : brandColors.white;
      expect(contrastRatio(btnFg, s.primary)).toBeGreaterThanOrEqual(4.5);
    });
  }
});
