// @vitest-environment jsdom
import {render, screen} from "@testing-library/react";
import {describe, expect, it} from "vitest";
import {ResponseErrorType} from "../../api/client";
import AccountError from "./Error";

describe("AccountError", () => {
  it("uses custom NOT_FOUND title and message when provided", () => {
    // Covers FEAT-MODULES-008 (clearer copy when modules are missing)
    render(
      <AccountError
        error={{type: ResponseErrorType.NOT_FOUND}}
        notFoundTitle="No move modules"
        notFoundMessage={<>Custom body</>}
      />,
    );
    expect(screen.getByText("No move modules")).toBeTruthy();
    expect(screen.getByText("Custom body")).toBeTruthy();
    expect(screen.queryByText("Account Not Found")).toBeNull();
  });
});
