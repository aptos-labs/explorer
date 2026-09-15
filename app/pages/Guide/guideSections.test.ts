import {describe, expect, it} from "vitest";
import {getMessage} from "../../i18n/translate";
import {en} from "../../i18n/messages/en";
import {GUIDE_SECTIONS} from "./guideSections";

describe("FEAT-GUIDE-001 — user guide outline", () => {
  it("gives every section a title and body copy in English", () => {
    expect(GUIDE_SECTIONS.length).toBeGreaterThanOrEqual(10);

    const ids = GUIDE_SECTIONS.map((section) => section.id);
    expect(new Set(ids).size).toBe(ids.length);

    for (const section of GUIDE_SECTIONS) {
      const title = getMessage(en, `${section.messageKey}.title`);
      expect(title, section.messageKey).toEqual(expect.any(String));
      expect(String(title).length).toBeGreaterThan(0);

      const paragraphs = getMessage(en, `${section.messageKey}.paragraphs`);
      const bullets = getMessage(en, `${section.messageKey}.bullets`);
      const more = getMessage(en, `${section.messageKey}.more`);
      const hasBody =
        (Array.isArray(paragraphs) && paragraphs.length > 0) ||
        (Array.isArray(bullets) && bullets.length > 0) ||
        (Array.isArray(more) && more.length > 0);
      expect(hasBody, `${section.messageKey} body`).toBe(true);
    }
  });
});
