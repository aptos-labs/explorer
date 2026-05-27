import {describe, expect, it} from "vitest";
import {
  poseidon1,
  poseidon2,
  poseidon3,
  poseidon4,
  poseidon5,
  poseidon6,
  poseidon7,
  poseidon8,
  poseidon9,
  poseidon10,
  poseidon11,
  poseidon12,
  poseidon13,
  poseidon14,
  poseidon15,
  poseidon16,
} from "./poseidon-lite";

// Guards the intentional decision to exclude poseidon-lite (Keyless ZKP hash
// library) from the client bundle. If these start passing silently the stub
// has been replaced by the real library — which would undo the 568 KB saving.
describe("poseidon-lite stub", () => {
  const allFns = [
    poseidon1,
    poseidon2,
    poseidon3,
    poseidon4,
    poseidon5,
    poseidon6,
    poseidon7,
    poseidon8,
    poseidon9,
    poseidon10,
    poseidon11,
    poseidon12,
    poseidon13,
    poseidon14,
    poseidon15,
    poseidon16,
  ] as const;

  it("exports all 16 poseidon functions", () => {
    for (const fn of allFns) {
      expect(fn).toBeTypeOf("function");
    }
  });

  it.each([
    ["poseidon1", poseidon1],
    ["poseidon2", poseidon2],
    ["poseidon3", poseidon3],
    ["poseidon4", poseidon4],
    ["poseidon5", poseidon5],
    ["poseidon6", poseidon6],
    ["poseidon7", poseidon7],
    ["poseidon8", poseidon8],
    ["poseidon9", poseidon9],
    ["poseidon10", poseidon10],
    ["poseidon11", poseidon11],
    ["poseidon12", poseidon12],
    ["poseidon13", poseidon13],
    ["poseidon14", poseidon14],
    ["poseidon15", poseidon15],
    ["poseidon16", poseidon16],
  ] as [
    string,
    () => never,
  ][])("%s throws with the expected message", (_name, fn) => {
    expect(() => fn()).toThrow(
      "poseidon-lite is not supported in this build (keyless not used)",
    );
  });
});
