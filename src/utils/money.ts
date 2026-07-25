// All wallet/payout amounts come from the backend in kobo (integer).
// Display them as Naira.

export function formatKobo(kobo: number, withDecimals = true): string {
  const naira = (kobo || 0) / 100;
  return `₦${naira.toLocaleString('en-NG', {
    minimumFractionDigits: withDecimals ? 2 : 0,
    maximumFractionDigits: withDecimals ? 2 : 0,
  })}`;
}

/** Parse a user-typed Naira string (e.g. "5,000" or "5000.50") into kobo. */
export function nairaToKobo(input: string): number {
  const naira = parseFloat(String(input).replace(/,/g, '')) || 0;
  return Math.round(naira * 100);
}
