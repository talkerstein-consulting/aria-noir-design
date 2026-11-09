// node pdf.mjs <review.html> <out.pdf>
import puppeteer from "puppeteer-core";
import path from "node:path";
const [src, out] = process.argv.slice(2);
const browser = await puppeteer.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: true,
  args: ["--allow-file-access-from-files"],
});
const page = await browser.newPage();
await page.goto("file:///" + path.resolve(src).replace(/\\/g, "/"), { waitUntil: "networkidle0", timeout: 300000 });
await page.pdf({
  path: out,
  format: "A4",
  printBackground: true,
  displayHeaderFooter: true,
  headerTemplate: "<div></div>",
  footerTemplate:
    '<div style="width:100%;font-size:7pt;color:#8a6d2f;padding:0 14mm;display:flex;justify-content:space-between;font-family:Arial"><span>ARIA NOIR · Website revisions, before and after</span><span><span class="pageNumber"></span> / <span class="totalPages"></span></span></div>',
  margin: { top: "14mm", bottom: "16mm", left: "14mm", right: "14mm" },
});
await browser.close();
console.log("ok", out);
