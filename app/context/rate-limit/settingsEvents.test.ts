import {afterEach, describe, expect, it, vi} from "vitest";
import {
  emitApiKeySaved,
  emitOpenSettings,
  onApiKeySaved,
  onOpenSettings,
} from "./settingsEvents";

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

  it("calls registered listener when api-key-saved is emitted", () => {
    const listener = vi.fn();
    const unsubscribe = onApiKeySaved(listener);

    emitApiKeySaved();
    expect(listener).toHaveBeenCalledTimes(1);

    unsubscribe();
  });

  it("does not call api-key-saved listener after unsubscribing", () => {
    const listener = vi.fn();
    const unsubscribe = onApiKeySaved(listener);

    unsubscribe();
    emitApiKeySaved();

    expect(listener).not.toHaveBeenCalled();
  });
});
