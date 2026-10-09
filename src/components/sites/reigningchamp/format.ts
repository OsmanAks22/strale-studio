/** Prices render like the source: "$325 USD", "$81.25 USD". */
export function formatPrice(amount: number) {
  const fixed = Number.isInteger(amount) ? amount.toString() : amount.toFixed(2);
  return `$${fixed} USD`;
}

const SIZE_ABBREVIATIONS: Record<string, string> = {
  "Extra Small": "XS",
  Small: "S",
  Medium: "M",
  Large: "L",
  "Extra Large": "XL",
  "XX Large": "XXL",
  "XXX Large": "XXXL",
  "One Size": "O/S",
};

/** Size buttons and facets show "XS", "M", "XXL"; variants store "Extra Small". */
export function sizeLabel(value: string) {
  return SIZE_ABBREVIATIONS[value] ?? value;
}
