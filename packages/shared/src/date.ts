const pad2 = (n: number) => (n < 10 ? `0${n}` : `${n}`);

export function toDateOnly(date: Date): string {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

export function fromDateOnly(dateOnly: string): Date {
  const [y, m, d] = dateOnly.split('-').map((v) => parseInt(v, 10));
  if (!y || !m || !d) return new Date(dateOnly);
  return new Date(y, m - 1, d);
}

