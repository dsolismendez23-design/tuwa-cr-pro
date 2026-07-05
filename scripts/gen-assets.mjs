import sharp from "sharp";
import { mkdirSync } from "node:fs";

const ROOT = new URL("..", import.meta.url).pathname.replace(/^\/([A-Za-z]):/, "$1:");
const SRC = `${ROOT}/logo.png`;
const PUB = `${ROOT}/public`;
mkdirSync(PUB, { recursive: true });

const BLACK = { r: 10, g: 10, b: 10, alpha: 1 };

async function main() {
  // 1. Wordmark only (boar + TUWA CR PRO), trimmed, for the compact app header.
  const wordmarkRaw = await sharp(SRC)
    .extract({ left: 50, top: 0, width: 430, height: 196 })
    .png()
    .toBuffer();
  await sharp(wordmarkRaw).trim({ threshold: 12 }).png().toFile(`${PUB}/logo-wordmark.png`);

  // 2. Boar icon only, generous bbox, trimmed, white background keyed out to transparency
  //    (icon is black-ink-on-white, so alpha = inverse luminance gives a clean cutout).
  const iconRaw = await sharp(SRC)
    .extract({ left: 45, top: 45, width: 130, height: 125 })
    .png()
    .toBuffer();
  const trimmed = sharp(iconRaw).trim({ threshold: 12 });
  const { data, info } = await trimmed.raw().toBuffer({ resolveWithObject: true });
  const { width: iw, height: ih, channels: ic } = info;
  const rgba = Buffer.alloc(iw * ih * 4);
  for (let i = 0; i < iw * ih; i++) {
    const r = data[i * ic];
    const g = data[i * ic + 1];
    const b = data[i * ic + 2];
    const luminance = (r + g + b) / 3;
    rgba[i * 4] = 255;
    rgba[i * 4 + 1] = 255;
    rgba[i * 4 + 2] = 255;
    rgba[i * 4 + 3] = 255 - luminance;
  }
  const iconBuf = await sharp(rgba, { raw: { width: iw, height: ih, channels: 4 } }).png().toBuffer();

  // 3. Square PWA icons on brand-black background (icon centered, padded) with an
  //    orange accent bar at the bottom to tie in the brand palette.
  async function squareIcon(size, padRatio) {
    const inner = Math.round(size * (1 - padRatio * 2));
    const resizedIcon = await sharp(iconBuf)
      .resize({ width: inner, height: inner, fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .toBuffer();
    const barHeight = Math.round(size * 0.07);
    const bar = await sharp({
      create: { width: size, height: barHeight, channels: 4, background: { r: 232, g: 121, b: 42, alpha: 1 } },
    })
      .png()
      .toBuffer();
    return sharp({
      create: {
        width: size,
        height: size,
        channels: 4,
        background: BLACK,
      },
    })
      .composite([
        { input: resizedIcon, gravity: "centre" },
        { input: bar, left: 0, top: size - barHeight },
      ])
      .png()
      .toFile(`${PUB}/${size === 180 ? "apple-touch-icon" : "icon-" + size}.png`);
  }

  await squareIcon(192, 0.14);
  await squareIcon(512, 0.14);
  await squareIcon(180, 0.14);

  // 4. Maskable icon: extra safe-zone padding since OSes crop to circle/squircle.
  const maskableInner = Math.round(512 * 0.6);
  const maskableIconResized = await sharp(iconBuf)
    .resize({ width: maskableInner, height: maskableInner, fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();
  await sharp({
    create: { width: 512, height: 512, channels: 4, background: BLACK },
  })
    .composite([{ input: maskableIconResized, gravity: "centre" }])
    .png()
    .toFile(`${PUB}/icon-maskable-512.png`);

  console.log("assets generated");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
