/**
 * Class name concatenation helper
 */
export function cn(
  ...classes: (string | boolean | number | undefined | null)[]
): string {
  return classes.filter(Boolean).join(' ');
}
