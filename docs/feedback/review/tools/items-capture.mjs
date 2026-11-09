// node items-capture.mjs <spec.json> <outDir> <base> <side: before|after>
import puppeteer from "puppeteer-core";
import fs from "node:fs";
import path from "node:path";

const [specPath, OUT, BASE, SIDE] = process.argv.slice(2);
const spec = JSON.parse(fs.readFileSync(specPath, "utf8"));
fs.mkdirSync(OUT, { recursive: true });
const VIEWS = {
  d: { width: 1440, height: 900, deviceScaleFactor: 1 },
  m: { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  l: { width: 844, height: 390, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
};
const b = await puppeteer.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: true, args: ["--hide-scrollbars", "--autoplay-policy=no-user-gesture-required"] });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const report = {};

for (const it of spec) {
  if (process.env.ONLY && !process.env.ONLY.split(",").includes(it.id)) continue;
  if (SIDE === "before" && it.afterOnly) { report[it.id] = "n/a"; continue; }
  const p = await b.newPage();
  await p.setViewport(VIEWS[it.view]);
  const popup = it.mode === "popup";
  await p.evaluateOnNewDocument((popup) => {
    try {
      localStorage.setItem("an:consent", "necessary");
      if (!popup) { localStorage.setItem("an:gift", "seen"); sessionStorage.setItem("an:gift", "seen"); }
    } catch {}
  }, popup);
  const file = path.join(OUT, `${it.id}.jpg`);
  try {
    const res = await p.goto(BASE + it.route, { waitUntil: "networkidle2", timeout: 180000 });
    await sleep(popup ? 14000 : 2500);
    if ((it.actions || []).includes("search")) {
      const btn = await p.$('button[aria-label="Search"]');
      if (btn) { await btn.evaluate((e) => e.click()); await sleep(900); await p.keyboard.type("arca"); await sleep(900); }
    }
    let target = null, pad = it.pad || 0;
    const scrollTo = async (h) => { await h.evaluate((e) => e.scrollIntoView({ block: "start" })); await sleep(1500); };
    if (it.mode === "el") target = await p.$(it.sel);
    if (it.mode === "text" || it.mode === "list") {
      const h = await p.evaluateHandle((t, list) => {
        if (list) return document.querySelector("main ol")?.closest("section") || null;
        const el = [...document.querySelectorAll("main *")].find((n) => n.children.length === 0 && n.textContent.includes(t));
        return el ? el.closest("section") : null;
      }, it.text || "", it.mode === "list");
      target = h.asElement();
    }
    if (it.mode === "img") {
      const key = SIDE === "before" ? it.imgBefore : it.imgAfter;
      const h = await p.evaluateHandle((k) => { const i = [...document.querySelectorAll("img")].find((x) => (x.currentSrc || x.src).includes(k)); return i ? (i.closest("figure") || i.parentElement) : null; }, key);
      target = h.asElement();
      pad = it.imgPad || 120;
    }
    if (it.mode === "fit") {
      const btn = await p.evaluateHandle(() => [...document.querySelectorAll("button.faq-q")].find((x) => x.textContent.trim().startsWith("Fit")) || null);
      if (btn.asElement()) { await scrollTo(btn.asElement()); await btn.asElement().evaluate((e) => e.click()); await sleep(1500); target = await p.$("#panel-fit"); pad = 60; }
      else { const h = await p.evaluateHandle(() => document.querySelector("button.faq-q")?.closest("ul") || null); target = h.asElement(); pad = 40; }
    }
    if (it.mode === "price") {
      const h = await p.evaluateHandle(() => [...document.querySelectorAll("main *")].find((n) => n.children.length === 0 && /^\$\d{2,4}$/.test(n.textContent.trim()) && n.getBoundingClientRect().top < 900) || null);
      target = h.asElement(); pad = 140;
    }
    if (target) {
      await scrollTo(target);
      if (pad) await p.evaluate((pd) => scrollBy(0, -pd), pad);
      await sleep(1200);
      const box = await target.boundingBox();
      const vp = p.viewport();
      let y = Math.max(0, box.y - pad), h = box.height + pad * 2;
      if (it.cropBottom) { y = Math.max(0, box.y + box.height - it.cropBottom); h = it.cropBottom; }
      h = Math.min(h, 1600);
      const x = it.mode === "price" ? Math.max(0, box.x - 40) : 0;
      const w = it.mode === "price" ? Math.min(vp.width - x, 560) : vp.width;
      await p.screenshot({ path: file, type: "jpeg", quality: 72, clip: { x, y: y + (await p.evaluate(() => scrollY)), width: w, height: h }, captureBeyondViewport: true });
      report[it.id] = "el";
    } else if (it.mode === "clip") {
      const [x, y, w, h] = it.clip;
      await p.screenshot({ path: file, type: "jpeg", quality: 75, clip: { x, y, width: w, height: h } });
      report[it.id] = "clip";
    } else {
      await p.screenshot({ path: file, type: "jpeg", quality: 72 });
      report[it.id] = (it.mode === "fold" || it.mode === "popup") ? `fold ${res?.status()}` : "fold-fallback";
    }
  } catch (e) { report[it.id] = "FAIL " + e.message.slice(0, 80); }
  await p.close();
}
await b.close();
console.log(JSON.stringify(report, null, 1));
