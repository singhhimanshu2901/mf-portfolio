// ======================================
// Shared Formatting Helpers
// ======================================
// Centralizing formatting fixes two recurring bugs across the report:
// 1) jsPDF's built-in fonts (Helvetica/Times/Courier) do NOT contain the
//    Unicode "₹" (Rupee) glyph. jsPDF silently falls back to a WinAnsi
//    byte, which renders as a stray "¹" superscript character.
//    Fix: use "Rs." instead of "₹" so it renders correctly with any
//    standard PDF font (no custom font embedding required).
//    (If you truly want the ₹ glyph, you must embed a Unicode TTF font
//    such as Noto Sans via doc.addFileToVFS/doc.addFont — happy to help
//    with that separately if needed.)
// 2) `Number.toLocaleString("en-IN")` without options can show up to
//    3 decimal digits by default (e.g. 13,805.922). Fix: always pass
//    minimumFractionDigits / maximumFractionDigits = 2.

export const safeNumber = (value, fallback = 0) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
};

// ₹ amounts -> "Rs. 13,805.92"
export const formatCurrency = (value) => {
  const num = safeNumber(value, 0);
  const formatted = num.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  return `Rs. ${formatted}`;
};

// Percentages -> "12.34%" (always 2 decimals)
export const formatPercent = (value, decimals = 2) => {
  const num = safeNumber(value, 0);
  return `${num.toFixed(decimals)}%`;
};

// Plain numbers with 2 decimals, no currency prefix -> "0.99x" style usage
export const formatNumber = (value, decimals = 2) => {
  const num = safeNumber(value, 0);
  return num.toFixed(decimals);
};
