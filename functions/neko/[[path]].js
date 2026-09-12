const SOURCE = "https://miku-doujin.com";

function responseHeaders(upstream) {
  const headers = new Headers(upstream.headers);
  headers.set("cache-control", "public, max-age=30, s-maxage=60, stale-while-revalidate=120");
  headers.set("x-content-type-options", "nosniff");
  headers.delete("set-cookie");
  // The runtime hands us a decoded body, so wire-encoding metadata must not leak through.
  headers.delete("content-encoding");
  headers.delete("content-length");
  return headers;
}

export async function onRequest({ request }) {
  if (request.method !== "GET" && request.method !== "HEAD") {
    return new Response("Method not allowed", {
      status: 405,
      headers: { allow: "GET, HEAD" },
    });
  }

  const requestUrl = new URL(request.url);
  const sourcePath = requestUrl.pathname.replace(/^\/neko(?=\/|$)/, "") || "/";
  const target = new URL(`${SOURCE}${sourcePath}`);
  target.search = requestUrl.search;

  try {
    const upstream = await fetch(target, {
      headers: {
        accept: request.headers.get("accept") || "text/html,image/avif,image/webp,*/*",
        "accept-language": request.headers.get("accept-language") || "th-TH,th;q=0.9,en;q=0.8",
        // miku-doujin.com's WAF rejects requests without an explicit gzip encoding.
        "accept-encoding": "gzip",
        referer: SOURCE + "/",
        "user-agent": "MANGA-NOVA/1.0 Cloudflare Pages Function",
      },
      cf: {
        cacheEverything: true,
        cacheTtl: 60,
      },
    });

    return new Response(request.method === "HEAD" ? null : upstream.body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: responseHeaders(upstream),
    });
  } catch (error) {
    console.error("Neko proxy error:", error instanceof Error ? error.message : error);
    return new Response("Upstream source unavailable", {
      status: 502,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }
}
