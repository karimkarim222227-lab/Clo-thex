/**
 * src/lib/barcode.ts
 * Barcode utilities — no external dependencies.
 * Implements CODE-128B rendering (SVG) + generation + print.
 */

// ─── CODE-128B encoding table ───────────────────────────────────────────────
const CODE128B_CHARS: Record<string, number> = {};
const CODE128B_PATTERNS: string[] = [
  "11011001100","11001101100","11001100110","10010011000","10010001100",
  "10001001100","10011001000","10011000100","10001100100","11001001000",
  "11001000100","11000100100","10110011100","10011011100","10011001110",
  "10111001100","10011101100","10011100110","11001110010","11001011100",
  "11001001110","11011100100","11001110100","11101101110","11101001100",
  "11100101100","11100100110","11101100100","11100110100","11100110010",
  "11011011000","11011000110","11000110110","10100011000","10001011000",
  "10001000110","10110001000","10001101000","10001100010","11010001000",
  "11000101000","11000100010","10110111000","10110001110","10001101110",
  "10111011000","10111000110","10001110110","11101110110","11010001110",
  "11000101110","11011101000","11011100010","11011101110","11101011000",
  "11101000110","11100010110","11101101000","11101100010","11100011010",
  "11101111010","11001000010","11110001010","10100110000","10100001100",
  "10010110000","10010000110","10000101100","10000100110","10110010000",
  "10110000100","10011010000","10011000010","10000110100","10000110010",
  "11000010010","11001010000","11110111010","11000010100","10001111010",
  "10100111100","10010111100","10010011110","10111100100","10011110100",
  "10011110010","11110100100","11110010100","11110010010","11011011110",
  "11011110110","11110110110","10101111000","10100011110","10001011110",
  "10111101000","10111100010","11110101000","11110100010","10111011110",
  "10111101110","11101011110","11110101110","11010000100","11010010000",
  "11010011100","1100011101011",
];

// Build char → value map for CODE-128B (values 32–126 map to indices 0–94)
" !\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~"
  .split("")
  .forEach((ch, i) => { CODE128B_CHARS[ch] = i; });

const START_B = 104;
const STOP    = 106;

function encodeCode128B(text: string): string {
  // Replace any non-printable chars with '?'
  const safe = text.replace(/[^ -~]/g, "?");

  let checksum = START_B;
  const bars = [CODE128B_PATTERNS[START_B]];

  safe.split("").forEach((ch, i) => {
    const val = CODE128B_CHARS[ch] ?? CODE128B_CHARS["?"]!;
    checksum += val * (i + 1);
    bars.push(CODE128B_PATTERNS[val]);
  });

  bars.push(CODE128B_PATTERNS[checksum % 103]);
  bars.push(CODE128B_PATTERNS[STOP]);
  return bars.join("");
}

// ─── SVG renderer ───────────────────────────────────────────────────────────

/**
 * Renders a CODE-128B barcode as an inline SVG string.
 * Used by BarcodePreview component.
 */
export function renderBarcodeToSvg(
  value: string,
  opts: { height?: number; moduleWidth?: number; fontSize?: number } = {}
): string {
  const { height = 60, moduleWidth = 2, fontSize = 10 } = opts;

  const pattern = encodeCode128B(value);
  const totalWidth = pattern.length * moduleWidth;
  const svgHeight = height + fontSize + 6;

  let x = 0;
  const rects: string[] = [];

  for (const bit of pattern) {
    if (bit === "1") {
      rects.push(`<rect x="${x}" y="0" width="${moduleWidth}" height="${height}" fill="black"/>`);
    }
    x += moduleWidth;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="${svgHeight}" viewBox="0 0 ${totalWidth} ${svgHeight}">
  <rect width="${totalWidth}" height="${svgHeight}" fill="white"/>
  ${rects.join("\n  ")}
  <text x="${totalWidth / 2}" y="${height + fontSize + 2}" font-family="monospace" font-size="${fontSize}" text-anchor="middle" fill="black">${value}</text>
</svg>`;
}

// ─── Value generator ─────────────────────────────────────────────────────────

/**
 * Generates a random 12-digit numeric barcode string (EAN-12 style).
 * Used by ProductFormDialog "generate" button.
 */
export function generateBarcodeValue(): string {
  const digits = Array.from({ length: 12 }, () => Math.floor(Math.random() * 10));
  return digits.join("");
}

// ─── Print helper ────────────────────────────────────────────────────────────

/**
 * Opens a minimal print window containing the barcode SVG + product name.
 * Used by ProductFormDialog "print" button.
 */
export function printBarcode(barcode: string, productName: string): void {
  const svg = renderBarcodeToSvg(barcode, { height: 70, moduleWidth: 2, fontSize: 11 });

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>Barcode — ${productName}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      font-family: monospace;
      background: white;
    }
    .label {
      font-size: 13px;
      margin-bottom: 6px;
      color: #111;
      text-align: center;
      max-width: 200px;
      word-break: break-word;
    }
    svg { display: block; }
  </style>
</head>
<body>
  <p class="label">${productName}</p>
  ${svg}
  <script>window.onload = () => { window.print(); window.onafterprint = () => window.close(); };<\/script>
</body>
</html>`;

  const win = window.open("", "_blank", "width=320,height=280");
  if (!win) {
    // Fallback: blob URL
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.target = "_blank";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
    return;
  }
  win.document.write(html);
  win.document.close();
}
