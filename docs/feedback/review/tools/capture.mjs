// node capture.mjs <outDir> [baseUrl]
import puppeteer from "puppeteer-core";
import fs from "node:fs";
import path from "node:path";

const OUT = process.argv[2];
const BASE = process.argv[3] || "http://localhost:3000";
const PAGES = [
  ["home", "/"],
  ["shop", "/shop"],
  ["arca-i", "/arca-i"],
  ["arca-ii", "/arca-ii"],
  ["ahava", "/ahava"],
  ["patriarca", "/patriarca"],
  ["monarca", "/monarca"],
  ["matriarca", "/matriarca"],
  ["shop-arca-i", "/shop/arca-i"],
  ["shop-arca-ii", "/shop/arca-ii"],
  ["shop-ahava", "/shop/ahava"],
  ["shop-patriarca", "/shop/patriarca"],
  ["about", "/house/about"],
  ["gallery", "/gallery"],
  ...(process.env.EXTRA ? [
    ["craftsmanship", "/house/craftsmanship"],
    ["heritage", "/house/heritage"],
    ["press", "/house/press"],
    ["careers", "/house/careers"],
    ["registration", "/house/registration"],
    ["el-patron", "/el-patron"],
  ] : []),
];
const VIEWS = [
  ["desktop", { width: 1440, height: 900, deviceScaleFactor: 1 }],
  ["mobile", { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true }],
];

fs.mkdirSync(OUT, { recursive: true });
const browser = await puppeteer.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: true,
  args: ["--hide-scrollbars", "--autoplay-policy=no-user-gesture-required", "--enable-unsafe-swiftshader"],
});
const only = process.env.ONLY ? process.env.ONLY.split(",") : null;
for (const [name, route] of PAGES) {
  if (only && !only.includes(name)) continue;
  for (const [view, vp] of VIEWS) {
    const page = await browser.newPage();
    await page.setViewport(vp);
    // answer the cookie bar up front so it does not cover the first screen
    await page.evaluateOnNewDocument(() => { try { localStorage.setItem("an:consent", "necessary"); localStorage.setItem("an:gift", "seen"); sessionStorage.setItem("an:gift", "seen"); } catch {} });
    try {
      await page.goto(BASE + route, { waitUntil: "networkidle2", timeout: 180000 });
      // first viewport, as a visitor lands
      await new Promise((r) => setTimeout(r, 3500));
      await page.screenshot({ path: path.join(OUT, `${name}-${view}-fold.jpg`), type: "jpeg", quality: 80 });
      // walk the page so lazy images and scroll-reveals settle, then capture the whole length
      const h = await page.evaluate(async () => {
        const step = innerHeight * 0.8;
        for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
          scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 350));
        }
        scrollTo(0, 0);
        await new Promise((r) => setTimeout(r, 800));
        return document.documentElement.scrollHeight;
      });
      await page.screenshot({ path: path.join(OUT, `${name}-${view}-full.jpg`), type: "jpeg", quality: 70, fullPage: true, captureBeyondViewport: true });
      console.log("ok", name, view, h);
    } catch (e) {
      console.log("FAIL", name, view, e.message.slice(0, 120));
    }
    await page.close();
  }
}
await browser.close();
