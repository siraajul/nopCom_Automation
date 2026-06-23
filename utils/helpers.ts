/** Small data helpers for generating unique test data on the fly. */

let counter = 0;

/** A process-unique, lowercase, valid email address. */
export function uniqueEmail(prefix = 'qa.auto'): string {
  counter += 1;
  const stamp = `${Date.now().toString(36)}${counter}${Math.floor(Math.random() * 1e4)}`;
  return `${prefix}.${stamp}@example.com`;
}

/** A reasonably strong password that satisfies nopCommerce rules (>= 6 chars). */
export function strongPassword(): string {
  return `Pass!${Math.floor(Math.random() * 1e6)}aA`;
}
