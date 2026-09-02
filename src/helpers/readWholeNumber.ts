export function readWholeNumber(
  environment: NodeJS.ProcessEnv,
  name: string,
  fallback: number,
  minimum: number,
  maximum = Number.MAX_SAFE_INTEGER,
): number {
  const rawValue = environment[name];

  if (rawValue === undefined || rawValue === "") {
    return fallback;
  }

  if (!/^\d+$/.test(rawValue)) {
    throw new Error(`${name} must be a whole number`);
  }

  const value = Number(rawValue);

  if (!Number.isSafeInteger(value) || value < minimum || value > maximum) {
    throw new Error(`${name} must be between ${minimum} and ${maximum}`);
  }

  return value;
}
