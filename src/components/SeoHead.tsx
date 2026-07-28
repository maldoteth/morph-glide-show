import { useEffect } from "react";

type SeoHeadProps = {
  title: string;
  description: string;
  path: string; // canonical path, e.g. "/legal"
  noindex?: boolean;
  image?: string;
  imageAlt?: string;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  jsonLd?: object | object[];
};

const SITE_ORIGIN = "https://pixcellor.com";
const DEFAULT_IMAGE = "https://pixcellor.com/__l5e/assets-v1/597b8c9d-3a38-48f3-ac7a-afbeec971967/og-default.png";

const upsertMeta = (selector: string, attrs: Record<string, string>) => {
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement("meta");
    Object.entries(attrs).forEach(([k, v]) => {
      if (k !== "content") el.setAttribute(k, v);
    });
    document.head.appendChild(el);
  }
  el.setAttribute("content", attrs.content);
};

const removeMeta = (selector: string) => {
  document.head.querySelectorAll(selector).forEach((el) => el.remove());
};

const upsertLink = (rel: string, href: string) => {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
};

/**
 * Per-route SEO head manager. Sets <title>, description, canonical,
 * robots, Open Graph, Twitter card tags and optional JSON-LD. Use on every page.
 *
 * Titles and descriptions are rendered exactly as authored — no runtime
 * truncation. Length discipline belongs at authoring time; in dev we warn.
 */
export default function SeoHead({
  title,
  description,
  path,
  noindex = false,
  image = DEFAULT_IMAGE,
  imageAlt,
  type = "website",
  publishedTime,
  modifiedTime,
  jsonLd,
}: SeoHeadProps) {
  useEffect(() => {
    const url = `${SITE_ORIGIN}${path.startsWith("/") ? path : `/${path}`}`;
    const alt = imageAlt ?? `${title} — Pixcellor™`;

    if (import.meta.env.DEV) {
      if (title.length > 60) {
        console.warn(`[SeoHead] Title is ${title.length} chars (>60) on "${path}": ${title}`);
      }
      if (description.length > 160) {
        console.warn(
          `[SeoHead] Description is ${description.length} chars (>160) on "${path}": ${description}`,
        );
      }
    }

    document.title = title;

    upsertMeta('meta[name="description"]', { name: "description", content: description });
    upsertMeta('meta[name="robots"]', {
      name: "robots",
      content: noindex
        ? "noindex, nofollow"
        : "index, follow, max-image-preview:large, max-snippet:-1",
    });

    upsertLink("canonical", url);

    // Open Graph
    upsertMeta('meta[property="og:title"]', { property: "og:title", content: title });
    upsertMeta('meta[property="og:description"]', { property: "og:description", content: description });
    upsertMeta('meta[property="og:url"]', { property: "og:url", content: url });
    upsertMeta('meta[property="og:type"]', { property: "og:type", content: type });
    // Always written, so a route without `image` overwrites the previous route's og:image.
    upsertMeta('meta[property="og:image"]', { property: "og:image", content: image });
    upsertMeta('meta[property="og:image:alt"]', { property: "og:image:alt", content: alt });
    upsertMeta('meta[property="og:image:width"]', { property: "og:image:width", content: "1200" });
    upsertMeta('meta[property="og:image:height"]', { property: "og:image:height", content: "630" });
    upsertMeta('meta[property="og:locale"]', { property: "og:locale", content: "en_GB" });
    upsertMeta('meta[property="og:site_name"]', { property: "og:site_name", content: "Pixcellor™" });

    // Article-only tags — removed on non-article routes so they never go stale.
    if (type === "article" && publishedTime) {
      upsertMeta('meta[property="article:published_time"]', {
        property: "article:published_time",
        content: publishedTime,
      });
    } else {
      removeMeta('meta[property="article:published_time"]');
    }
    if (type === "article" && modifiedTime) {
      upsertMeta('meta[property="article:modified_time"]', {
        property: "article:modified_time",
        content: modifiedTime,
      });
    } else {
      removeMeta('meta[property="article:modified_time"]');
    }

    // Twitter
    upsertMeta('meta[name="twitter:card"]', { name: "twitter:card", content: "summary_large_image" });
    upsertMeta('meta[name="twitter:title"]', { name: "twitter:title", content: title });
    upsertMeta('meta[name="twitter:description"]', { name: "twitter:description", content: description });
    upsertMeta('meta[name="twitter:image"]', { name: "twitter:image", content: image });
    upsertMeta('meta[name="twitter:image:alt"]', { name: "twitter:image:alt", content: alt });
  }, [title, description, path, noindex, image, imageAlt, type, publishedTime, modifiedTime]);

  // JSON-LD: injected per route and always cleaned up, so schema from one route
  // can never leak onto the next during client-side navigation.
  useEffect(() => {
    document.head.querySelectorAll("script[data-seo-head]").forEach((el) => el.remove());
    if (!jsonLd) return;

    const blocks = Array.isArray(jsonLd) ? jsonLd : [jsonLd];
    const nodes = blocks.map((block) => {
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.setAttribute("data-seo-head", "1");
      script.textContent = JSON.stringify(block);
      document.head.appendChild(script);
      return script;
    });

    return () => nodes.forEach((node) => node.remove());
  }, [jsonLd]);

  return null;
}
