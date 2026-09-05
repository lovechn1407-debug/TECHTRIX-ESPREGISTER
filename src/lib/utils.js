/**
 * Utility function to combine class names
 * Supports strings, objects, arrays, and falsy values
 */
export function cn(...inputs) {
  return inputs
    .flat()
    .filter(Boolean)
    .join(' ')
    .trim();
}

export default cn;
