import { sValidator } from "@hono/standard-validator";
import * as cheerio from "cheerio";
import { Hono } from "hono";
import { cache } from "hono/cache";
import { appendTrailingSlash } from "hono/trailing-slash";
import * as v from "valibot";
import type { LinkPreview } from "../src/link-preview.ts";
import { linkPreviewSchema } from "../src/link-preview.ts";

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
    const query = c.req.valid("query");
    const response = await fetchLinkPreviewPage(query.url);
    const html = await response.text();

    return c.json(createLinkPreview(response.url, html));
  },
);

function normalizeUrl(domain: string, url: string | undefined): string | undefined {
  if (url === undefined || url === "") {
    return url;
  }

  if (url.startsWith("http")) {
    return url;
  }

  return `https://${domain}${url}`;
}

async function fetchLinkPreviewPage(url: string): Promise<Response> {
  const response = await fetch(url, {
    signal: AbortSignal.timeout(5000),
    headers: {
      "User-Agent": "LinkPreviewBot/1.0",
      Accept: "text/html",
    },
  });

  return response;
}

function createLinkPreview(responseUrl: string, html: string): LinkPreview {
  const $ = cheerio.load(html);
  const domain = new URL(responseUrl).hostname;
  const documentTitle = $("title").text().trim();
  const title =
    documentTitle === ""
      ? getFirstDefined(
          $("meta[itemprop='name']").attr("content"),
          $("meta[property='og:title']").attr("content"),
          $("meta[name='twitter:title']").attr("content"),
        )
      : documentTitle;
  const description = getFirstDefined(
    $("meta[name='description']").attr("content"),
    $("meta[itemprop='description']").attr("content"),
    $("meta[property='og:description']").attr("content"),
    $("meta[name='twitter:description']").attr("content"),
  );
  const favicon = getFirstDefined(
    $("link[rel='icon']").attr("href"),
    $("link[rel='shortcut icon']").attr("href"),
    $("link[rel='apple-touch-icon']").attr("href"),
  );
  const image = getFirstDefined(
    $("meta[itemprop='image']").attr("content"),
    $("meta[property='og:image']").attr("content"),
    $("meta[name='twitter:image']").attr("content"),
  );

  return v.parse(linkPreviewSchema, {
    domain,
    title,
    description,
    favicon: normalizeUrl(domain, favicon),
    image: normalizeUrl(domain, image),
  });
}

function getFirstDefined(...values: (string | undefined)[]): string | undefined {
  return values.find((value) => value !== undefined && value !== "");
}

export type AppType = typeof route;

export default app;
