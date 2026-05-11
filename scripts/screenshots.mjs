import { mkdir } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, join, resolve } from "node:path";
import { createReadStream } from "node:fs";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const rootDir = resolve(fileURLToPath(new URL("..", import.meta.url)));
const outputDir = join(rootDir, "docs", "screenshots");
const port = Number(process.env.SCREENSHOT_PORT || 0);
const host = "127.0.0.1";

const contentTypes = new Map([
  [".css", "text/css; charset=utf-8"],
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".png", "image/png"],
  [".svg", "image/svg+xml; charset=utf-8"]
]);

const viewports = [
  { name: "popup", width: 390, height: 844 },
  { name: "popup-compact", width: 364, height: 720 }
];

function serveFile(request, response) {
  const url = new URL(request.url || "/", `http://${host}`);
  const pathname = url.pathname === "/" ? "/popup.html" : url.pathname;
  const filePath = resolve(rootDir, `.${decodeURIComponent(pathname)}`);

  if (!filePath.startsWith(rootDir)) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  response.setHeader("Cache-Control", "no-store");
  response.setHeader("Content-Type", contentTypes.get(extname(filePath)) || "application/octet-stream");

  createReadStream(filePath)
    .on("error", () => {
      response.writeHead(404);
      response.end("Not found");
    })
    .pipe(response);
}

async function listen(server) {
  await new Promise((resolveListen, rejectListen) => {
    server.once("error", rejectListen);
    server.listen(port, host, resolveListen);
  });
  return server.address().port;
}

async function close(server) {
  await new Promise((resolveClose, rejectClose) => {
    server.close((error) => {
      if (error) rejectClose(error);
      else resolveClose();
    });
  });
}

const server = createServer(serveFile);

await mkdir(outputDir, { recursive: true });
const activePort = await listen(server);

try {
  const browser = await chromium.launch();

  try {
    for (const viewport of viewports) {
      const page = await browser.newPage({
        colorScheme: "dark",
        viewport: {
          width: viewport.width,
          height: viewport.height
        }
      });

      await page.goto(`http://${host}:${activePort}/popup.html`, { waitUntil: "networkidle" });
      await page.screenshot({
        fullPage: false,
        path: join(outputDir, `${viewport.name}.png`)
      });
      await page.close();
    }
  } finally {
    await browser.close();
  }
} finally {
  await close(server);
}

console.log(`Screenshots saved to ${outputDir}`);
