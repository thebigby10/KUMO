/**
 * Generates a random alphanumeric code for labs/classrooms.
 * Used when an instructor creates a new lab.
 *
 * @param length - The length of the code (default: 6)
 * @returns A string like "A7B2X9"
 */
export function generateLabCode(length = 6) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
