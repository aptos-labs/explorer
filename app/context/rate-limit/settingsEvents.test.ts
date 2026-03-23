import {afterEach, describe, expect, it, vi} from "vitest";
import {emitOpenSettings, onOpenSettings} from "./settingsEvents";

describe("settingsEvents", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("calls registered listener when open-settings is emitted", () => {
    const listener = vi.fn();
    const unsubscribe = onOpenSettings(listener);

    emitOpenSettings();
    expect(listener).toHaveBeenCalledTimes(1);

    unsubscribe();
  });

  it("does not call listener after unsubscribing", () => {
    const listener = vi.fn();
    const unsubscribe = onOpenSettings(listener);

    unsubscribe();
    emitOpenSettings();

    expect(listener).not.toHaveBeenCalled();
  });
});
