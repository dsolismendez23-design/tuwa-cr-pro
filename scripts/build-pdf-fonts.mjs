import { readFileSync, writeFileSync } from "node:fs";
import * as subsetNs from "subset-font";
const subsetFont = subsetNs.default ?? subsetNs;

// Printable ASCII + Spanish accents/ñ + currency signs + common punctuation
// that might show up in free-form client/product text.
let charset = "";
for (let code = 0x20; code <= 0x7e; code++) charset += String.fromCharCode(code);
const extra = [
  0xe1, 0xe9, 0xed, 0xf3, 0xfa, // á é í ó ú
  0xc1, 0xc9, 0xcd, 0xd3, 0xda, // Á É Í Ó Ú
  0xf1, 0xd1, // ñ Ñ
  0xfc, 0xdc, // ü Ü
  0xbf, 0xa1, // ¿ ¡
  0x20a1, // ₡
  0x2013, 0x2014, // – —
  0x2018, 0x2019, 0x201c, 0x201d, // ' ' " "
  0x2022, 0xb7, 0xd7, 0xf7, // • · × ÷
  0xb0, 0xaa, // ° ª
];
for (const code of extra) charset += String.fromCodePoint(code);

async function buildOne(srcPath, outName) {
  const buffer = readFileSync(srcPath);
  const subset = await subsetFont(buffer, charset, { targetFormat: "sfnt" });
  return subset.toString("base64");
}

const regular = await buildOne("C:\\Windows\\Fonts\\arial.ttf", "regular");
const bold = await buildOne("C:\\Windows\\Fonts\\arialbd.ttf", "bold");

writeFileSync(
  "src/lib/pdfFonts.ts",
  `// Subset of Arial (regular/bold) embedding only the characters used in the\n` +
    `// generated PDF (Basic Latin + Spanish accents + ₡/$). Standard PDF fonts\n` +
    `// (Helvetica) don't include the Costa Rican colon sign, so without this the\n` +
    `// ₡ symbol rendered as a broken glyph in the exported PDF.\n` +
    `export const PDF_FONT_REGULAR_BASE64 = "${regular}";\n` +
    `export const PDF_FONT_BOLD_BASE64 = "${bold}";\n`
);

console.log("regular bytes (base64):", regular.length, "bold bytes (base64):", bold.length);
