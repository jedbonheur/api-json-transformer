import type { JsonValue } from "../types/json.js";

export interface ReplacementResult {
  value: JsonValue;
  replacements: number;
}

interface ItemToVisit {
  parent: Record<string, JsonValue>;
  key: string;
}

export function replaceDogValues(
  input: JsonValue,
  maxReplacements: number,
): ReplacementResult {
  if (!Number.isSafeInteger(maxReplacements) || maxReplacements < 0) {
    throw new RangeError("maxReplacements must be a non-negative integer");
  }

  const root: Record<string, JsonValue> = { value: input };
  const itemsToVisit: ItemToVisit[] = [
    {
      parent: root,
      key: "value",
    },
  ];

  let replacements = 0;

  while (itemsToVisit.length > 0 && replacements < maxReplacements) {
    const item = itemsToVisit.pop();

    if (item === undefined) {
      break;
    }

    const currentValue = item.parent[item.key];

    if (currentValue === "dog") {
      item.parent[item.key] = "cat";
      replacements += 1;
      continue;
    }

    if (currentValue === null || typeof currentValue !== "object") {
      continue;
    }

    const container = currentValue as unknown as Record<string, JsonValue>;
    const keys = Object.keys(container);

    for (let index = keys.length - 1; index >= 0; index -= 1) {
      const key = keys[index];

      if (key !== undefined) {
        itemsToVisit.push({
          parent: container,
          key,
        });
      }
    }
  }

  return {
    value: root.value as JsonValue,
    replacements,
  };
}
