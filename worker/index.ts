import { sValidator } from "@hono/standard-validator";
import * as cheerio from "cheerio";
import { Hono } from "hono";
import { appendTrailingSlash } from "hono/trailing-slash";
import { cache } from "hono/cache";
import * as v from "valibot";

const app = new Hono().basePath("/api/");

app.use(appendTrailingSlash());

export const querySchema = v.object({
  url: v.pipe(
    v.string(),
    v.nonEmpty("Missing ?url=https://github.com/emmanuelchucks"),
    v.url("Invalid url"),
  ),
});

export const route = app.get(
  "/",
  cache({
    cacheName: "link-preview-cache",
    cacheControl: "max-age=3600",
  }),
  sValidator("query", querySchema),
  async (c) => {
    const { url } = c.req.valid("query");

    const response = await fetch(url, {
      signal: AbortSignal.timeout(5000),
      headers: {
        "User-Agent": "LinkPreviewBot/1.0",
        Accept: "text/html",
      },
    });

    const html = await response.text();

    const $ = cheerio.load(html);
    const domain = new URL(response.url).hostname;

    const title =
      $("title").text() ||
      $("meta[itemprop='name']").attr("content") ||
      $("meta[property='og:title']").attr("content") ||
      $("meta[name='twitter:title']").attr("content");

    const description =
      $("meta[name='description']").attr("content") ||
      $("meta[itemprop='description']").attr("content") ||
      $("meta[property='og:description']").attr("content") ||
      $("meta[name='twitter:description']").attr("content");

    const favicon =
      $("link[rel='icon']").attr("href") ||
      $("link[rel='shortcut icon']").attr("href") ||
      $("link[rel='apple-touch-icon']").attr("href");

    const image =
      $("meta[itemprop='image']").attr("content") ||
      $("meta[property='og:image']").attr("content") ||
      $("meta[name='twitter:image']").attr("content");

    const meta = {
      domain,
      title,
      description,
      favicon: normalizeUrl(domain, favicon),
      image: normalizeUrl(domain, image),
    };

    return c.json(meta);
  },
);

function normalizeUrl(
  domain: string,
  url: string | undefined,
): string | undefined {
  if (!url || url.startsWith("http")) return url;
  return `https://${domain}${url}`;
}

export type AppType = typeof route;

export default app;
