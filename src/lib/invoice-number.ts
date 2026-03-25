/**
 * Generate auto-incrementing invoice/proposal numbers.
 * Format: INV-2026-001, PROP-2026-001
 */
export function generateDocumentNumber(
  type: "invoice" | "proposal",
  existingCount: number
): string {
  const prefix = type === "invoice" ? "INV" : "PROP";
  const year = new Date().getFullYear();
  const number = String(existingCount + 1).padStart(3, "0");
  return `${prefix}-${year}-${number}`;
}
