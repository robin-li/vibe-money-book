/**
 * Parse comma-separated regex patterns from environment variable.
 * Returns undefined if env var is not set or empty (use default patterns).
 * Logs warning and returns undefined if any pattern fails to parse.
 */
export function parseEnvPatterns(envVar: string | undefined): RegExp[] | undefined {
  if (!envVar?.trim()) return undefined;

  try {
    return envVar.split(',').map((p) => new RegExp(p.trim(), 'i'));
  } catch (err) {
    console.warn(`[ModelFilter] Failed to parse patterns "${envVar}":`, err);
    return undefined;
  }
}

/**
 * Load include/exclude patterns for a provider.
 * Environment variable overrides take precedence over code defaults.
 */
export function loadModelFilters(
  includeEnvKey: string,
  excludeEnvKey: string,
  defaultIncludes: RegExp[],
  defaultExcludes: RegExp[],
): { includes: RegExp[]; excludes: RegExp[] } {
  return {
    includes: parseEnvPatterns(process.env[includeEnvKey]) ?? defaultIncludes,
    excludes: parseEnvPatterns(process.env[excludeEnvKey]) ?? defaultExcludes,
  };
}
