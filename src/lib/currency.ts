export function formatQAR(amount: unknown): string {
  const num = parseDecimal(amount);
  return `QAR ${num.toLocaleString("en-QA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function parseDecimal(value: unknown): number {
  if (value === null || value === undefined) return 0;
  const n = parseFloat(String(value));
  return isNaN(n) ? 0 : n;
}
