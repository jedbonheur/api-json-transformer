import { describe, expect, it } from "vitest";

import { replaceDogValues } from "../src/services/replaceDogValues.js";
import type { JsonValue } from "../src/types/json.js";

describe("replaceDogValues", () => {
  it("replaces exact dog values inside objects and arrays", () => {
    const input: JsonValue = {
      pet: "dog",
      nested: ["dog", { animal: "dog" }],
      count: 2,
    };

    const result = replaceDogValues(input, 10);

    expect(result).toEqual({
      value: {
        pet: "cat",
        nested: ["cat", { animal: "cat" }],
        count: 2,
      },
      replacements: 3,
    });
  });

  it("only replaces exact, case-sensitive dog values", () => {
    const input: JsonValue = {
      dog: "doghouse",
      capitalized: "Dog",
      spaced: " dog ",
      exact: "dog",
    };

    expect(replaceDogValues(input, 10)).toEqual({
      value: {
        dog: "doghouse",
        capitalized: "Dog",
        spaced: " dog ",
        exact: "cat",
      },
      replacements: 1,
    });
  });

  it("stops replacing when it reaches the maximum", () => {
    const input: JsonValue = {
      first: "dog",
      nested: {
        second: "dog",
        third: "dog",
      },
      last: "dog",
    };

    expect(replaceDogValues(input, 2)).toEqual({
      value: {
        first: "cat",
        nested: {
          second: "cat",
          third: "dog",
        },
        last: "dog",
      },
      replacements: 2,
    });
  });

  it("allows a maximum of zero", () => {
    const input: JsonValue = ["dog", { pet: "dog" }];

    expect(replaceDogValues(input, 0)).toEqual({
      value: ["dog", { pet: "dog" }],
      replacements: 0,
    });
  });

  it.each([
    ["dog", "cat", 1],
    ["bird", "bird", 0],
    [null, null, 0],
    [42, 42, 0],
    [false, false, 0],
  ] as const)(
    "handles the root JSON value %j",
    (input, expectedValue, expectedCount) => {
      expect(replaceDogValues(input, 10)).toEqual({
        value: expectedValue,
        replacements: expectedCount,
      });
    },
  );

  it.each([-1, 1.5, Number.MAX_SAFE_INTEGER + 1])(
    "rejects the invalid maximum %s",
    (maximum) => {
      expect(() => replaceDogValues("dog", maximum)).toThrow(RangeError);
    },
  );

  it("handles deeply nested JSON without overflowing the call stack", () => {
    let input: JsonValue = "dog";

    for (let level = 0; level < 10_000; level += 1) {
      input = [input];
    }

    expect(() => replaceDogValues(input, 1)).not.toThrow();
  });
});
