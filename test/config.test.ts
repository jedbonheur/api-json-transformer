import { describe, expect, it } from "vitest";

import { loadConfig } from "../src/config.js";

describe("loadConfig", () => {
  it("uses safe defaults", () => {
    expect(loadConfig({})).toEqual({
      maxReplacements: 100,
      maxBodyBytes: 1_000_000,
      port: 3000,
    });
  });

  it("reads settings from the environment", () => {
    expect(
      loadConfig({
        MAX_REPLACEMENTS: "5",
        MAX_BODY_BYTES: "2048",
        PORT: "8080",
      }),
    ).toEqual({
      maxReplacements: 5,
      maxBodyBytes: 2048,
      port: 8080,
    });
  });

  it.each([
    ["MAX_REPLACEMENTS", "-1"],
    ["MAX_REPLACEMENTS", "1.5"],
    ["MAX_BODY_BYTES", "0"],
    ["PORT", "65536"],
  ])("rejects invalid %s=%s", (name, value) => {
    expect(() => loadConfig({ [name]: value })).toThrow(name);
  });
});
