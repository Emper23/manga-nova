import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { request as httpsRequest } from "node:https";

const ROOT = resolve(fileURLToPath(new URL("./dist/", import.meta.url)));
const SOURCE = "https://mangablackcat.com";
const NEKO_SOURCE = "https://miku-doujin.com";
const DEVIL_SOURCE = "https://www.devil69porn.tv";

/**
 * Minimal GET client on top of node:https.
 * Global fetch() (undici) is rejected outright by miku-doujin.com's WAF,
 * while requests built on node:https go through untouched.
 */
function fetchUpstream(url, headers, redirectsLeft = 4) {
  return new Promise((resolve, reject) => {
    const req = httpsRequest(url, { method: "GET", headers }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location && redirectsLeft > 0) {
        res.resume();
        resolve(fetchUpstream(new URL(res.headers.location, url).toString(), headers, redirectsLeft - 1));
        return;
      }
      const chunks = [];
      res.on("data", (chunk) => chunks.push(chunk));
      res.on("end", () =>
        resolve({
          status: res.statusCode || 502,
          contentType: res.headers["content-type"] || "text/html; charset=utf-8",
          body: Buffer.concat(chunks),
        })
      );
    });
    req.on("error", reject);
    req.end();
  });
}

const PROXY_TTL = 60 * 1000;
const proxyCache = new Map();
const MIME = {
  ".css": "text/css; charset=utf-8",
  ".gif": "image/gif",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

function portFromArgs() {
  const index = process.argv.findIndex((arg) => arg === "--port");
  if (index >= 0 && process.argv[index + 1]) return Number(process.argv[index + 1]);
  const inline = process.argv.find((arg) => arg.startsWith("--port="));
  return inline ? Number(inline.slice("--port=".length)) : Number(process.env.PORT || 4173);
}

function send(res, status, body, type = "text/plain; charset=utf-8") {
  res.statusCode = status;
  res.setHeader("Content-Type", type);
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.end(body);
}

async function proxyBully(url, req, res) {
  const path = url.pathname.replace(/^\/blackcat(?=\/|$)/, "") || "/";
  const key = `${path}${url.search}`;
  const cached = proxyCache.get(key);
  if (cached && cached.expires > Date.now()) {
    res.statusCode = cached.status;
    res.setHeader("Content-Type", cached.contentType);
    res.setHeader("Cache-Control", "public, max-age=30, stale-while-revalidate=60");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.end(cached.body);
    return;
  }

  const target = `${SOURCE}${path}${url.search}`;
  try {
    const upstream = await fetchUpstream(target, {
      accept: req.headers.accept || "text/html",
      "user-agent": "MANGA-NOVA-demo/1.0",
    });
    res.statusCode = upstream.status;
    res.setHeader("Content-Type", upstream.contentType);
    res.setHeader("Cache-Control", "public, max-age=30, stale-while-revalidate=60");
    res.setHeader("X-Content-Type-Options", "nosniff");
    if (upstream.status >= 200 && upstream.status < 300)
      proxyCache.set(key, { status: upstream.status, contentType: upstream.contentType, body: upstream.body, expires: Date.now() + PROXY_TTL });
    res.end(upstream.body);
  } catch (error) {
    console.error("Bully proxy error:", error instanceof Error ? error.message : error);
    send(res, 502, "แหล่งข้อมูลต้นทางไม่พร้อมใช้งาน");
  }
}

async function proxyNeko(url, req, res) {
  const path = url.pathname.replace(/^\/neko(?=\/|$)/, "") || "/";
  const key = `neko:${path}${url.search}`;
  const cached = proxyCache.get(key);
  if (cached && cached.expires > Date.now()) {
    res.statusCode = cached.status;
    res.setHeader("Content-Type", cached.contentType);
    res.setHeader("Cache-Control", "public, max-age=30, stale-while-revalidate=60");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.end(cached.body);
    return;
  }

  const target = `${NEKO_SOURCE}${path}${url.search}`;
  try {
    const upstream = await fetchUpstream(target, {
      accept: req.headers.accept || "text/html,image/avif,image/webp,*/*",
      "accept-language": req.headers["accept-language"] || "th-TH,th;q=0.9,en;q=0.8",
      referer: `${NEKO_SOURCE}/`,
      "user-agent": "MANGA-NOVA-demo/1.0",
    });
    res.statusCode = upstream.status;
    res.setHeader("Content-Type", upstream.contentType);
    res.setHeader("Cache-Control", "public, max-age=30, stale-while-revalidate=60");
    res.setHeader("X-Content-Type-Options", "nosniff");
    if (upstream.status >= 200 && upstream.status < 300)
      proxyCache.set(key, { status: upstream.status, contentType: upstream.contentType, body: upstream.body, expires: Date.now() + PROXY_TTL });
    res.end(upstream.body);
  } catch (error) {
    console.error("Neko proxy error:", error instanceof Error ? error.message : error);
    send(res, 502, "แหล่งข้อมูลต้นทางไม่พร้อมใช้งาน");
  }
}

async function proxyDevil(url, req, res) {
  const path = url.pathname.replace(/^\/devil(?=\/|$)/, "") || "/";
  const key = `devil:${path}${url.search}`;
  const cached = proxyCache.get(key);
  if (cached && cached.expires > Date.now()) {
    res.statusCode = cached.status;
    res.setHeader("Content-Type", cached.contentType);
    res.setHeader("Cache-Control", "public, max-age=30, stale-while-revalidate=60");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.end(cached.body);
    return;
  }

  const target = `${DEVIL_SOURCE}${path}${url.search}`;
  try {
    const upstream = await fetchUpstream(target, {
      accept: req.headers.accept || "text/html,image/avif,image/webp,*/*",
      "accept-language": req.headers["accept-language"] || "th-TH,th;q=0.9,en;q=0.8",
      referer: `${DEVIL_SOURCE}/`,
      "user-agent": "MANGA-NOVA-demo/1.0",
    });
    res.statusCode = upstream.status;
    // The player iframe is embedded on our own origin — drop framing guards.
    const contentType = upstream.contentType;
    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "public, max-age=30, stale-while-revalidate=60");
    res.setHeader("X-Content-Type-Options", "nosniff");
    if (upstream.status >= 200 && upstream.status < 300)
      proxyCache.set(key, { status: upstream.status, contentType, body: upstream.body, expires: Date.now() + PROXY_TTL });
    res.end(upstream.body);
  } catch (error) {
    console.error("Devil proxy error:", error instanceof Error ? error.message : error);
    send(res, 502, "แหล่งข้อมูลต้นทางไม่พร้อมใช้งาน");
  }
}

async function serveStatic(url, res) {
  let pathname;
  try {
    pathname = decodeURIComponent(url.pathname);
  } catch {
    send(res, 400, "Bad request");
    return;
  }

  const candidate = resolve(ROOT, `.${pathname === "/" ? "/index.html" : pathname}`);
  if (!candidate.startsWith(ROOT)) {
    send(res, 403, "Forbidden");
    return;
  }

  let filePath = candidate;
  try {
    const info = await stat(filePath);
    if (!info.isFile()) throw new Error("not a file");
  } catch {
    filePath = resolve(ROOT, "index.html");
  }

  try {
    const body = await readFile(filePath);
    res.statusCode = 200;
    res.setHeader("Content-Type", MIME[extname(filePath).toLowerCase()] || "application/octet-stream");
    res.setHeader(
      "Cache-Control",
      filePath.endsWith("index.html") ? "no-cache" : "public, max-age=31536000, immutable"
    );
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.end(body);
  } catch {
    send(res, 500, "สร้าง production build ก่อนใช้งานเซิร์ฟเวอร์");
  }
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);

  if (url.pathname === "/health") {
    send(res, 200, JSON.stringify({ ok: true }), "application/json; charset=utf-8");
    return;
  }

  if (req.method !== "GET" && req.method !== "HEAD") {
    send(res, 405, "Method not allowed");
    return;
  }

  if (url.pathname === "/blackcat" || url.pathname.startsWith("/blackcat/")) {
    await proxyBully(url, req, res);
    return;
  }

  if (url.pathname === "/neko" || url.pathname.startsWith("/neko/")) {
    await proxyNeko(url, req, res);
    return;
  }

  if (url.pathname === "/devil" || url.pathname.startsWith("/devil/")) {
    await proxyDevil(url, req, res);
    return;
  }

  await serveStatic(url, res);
});

const host = process.env.HOST || "0.0.0.0";
const port = portFromArgs();
server.listen(port, host, () => {
  console.log(`MANGA NOVA listening on http://${host === "0.0.0.0" ? "localhost" : host}:${port}`);
});
