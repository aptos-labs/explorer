// @vitest-environment jsdom
// Covers FEAT-SEARCH-001 — shared search helper text (with ANS tooltip)
import type {AutocompleteRenderInputParams} from "@mui/material";
import {cleanup, render} from "@testing-library/react";
import {afterEach, describe, expect, it} from "vitest";
import SearchInput from "./SearchInput";

const params = {
  id: "search",
  disabled: false,
  fullWidth: true,
  size: undefined,
  InputLabelProps: {},
  InputProps: {
    ref: () => {},
    className: "",
    startAdornment: null,
    endAdornment: null,
  },
  inputProps: {},
  slotProps: {input: {}, htmlInput: {}, inputLabel: {}},
} as unknown as AutocompleteRenderInputParams;

afterEach(cleanup);

describe("FEAT-SEARCH-001 — SearchInput helper text", () => {
  it("does not nest block elements inside a <p> helper", () => {
    const {container} = render(<SearchInput {...params} />);
    const helper = container.querySelector(".MuiFormHelperText-root");
    expect(helper?.textContent).toContain("ANS");
    expect(helper?.tagName).not.toBe("P");
    expect(container.querySelector("p div")).toBeNull();
  });
});
