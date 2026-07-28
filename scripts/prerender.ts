// Build-time prerender: emits one real HTML file per indexable route so that
// social crawlers (Facebook, WhatsApp, Telegram, LinkedIn, Slack, Discord, X)
// and AI crawlers — none of which execute JavaScript — receive that route's own
// title, description, canonical, Open Graph card and JSON-LD.
//
//   bun scripts/prerender.ts <distDir>
//
// The emitted files are byte-identical to dist/index.html except for the head,
// so the SPA hydrates and client-side navigation is unchanged.

import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { join, resolve } from "path";

import { ALL_ROUTE_META, type RouteMeta } from "@/lib/seo/staticMeta";
import { SITE_ORIGIN } from "@/lib/seo/routes";

const distDir = resolve(process.argv[2] ?? "dist");
const templatePath = join(distDir, "index.html");

// Publish guard: keep the emitted page count far below the hosting limit.
const MAX_PRERENDER_PAGES = 2000;

/** Escape for use inside a double-quoted HTML attribute. */
const attr = (value: string): string =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

/** Escape for use as HTML text (inside <title>). */
const text = (value: string): string =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** JSON-LD is script content — only `<` needs neutralising. */
const ldJson = (block: object): string =>
  JSON.stringify(block).replace(/</g, "\\u003c").replace(/\u2028|\u2029/g, "");

const headFor = (meta: RouteMeta): string => {
  const url = `${SITE_ORIGIN}${meta.path === "/" ? "/" : meta.path}`;
  const alt = `${meta.title} — Pixcellor™`;

  const tags = [
    `<link rel="canonical" href="${attr(url)}">`,
    `<meta name="description" content="${attr(meta.description)}">`,
    `<meta property="og:type" content="website">`,
    `<meta property="og:site_name" content="Pixcellor™">`,
    `<meta property="og:locale" content="en_GB">`,
    `<meta property="og:title" content="${attr(meta.title)}">`,
    `<meta property="og:description" content="${attr(meta.description)}">`,
    `<meta property="og:url" content="${attr(url)}">`,
    `<meta property="og:image" content="${attr(meta.image)}">`,
    `<meta property="og:image:alt" content="${attr(alt)}">`,
    `<meta property="og:image:width" content="1200">`,
    `<meta property="og:image:height" content="630">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="twitter:title" content="${attr(meta.title)}">`,
    `<meta name="twitter:description" content="${attr(meta.description)}">`,
    `<meta name="twitter:url" content="${attr(url)}">`,
    `<meta name="twitter:image" content="${attr(meta.image)}">`,
    `<meta name="twitter:image:alt" content="${attr(alt)}">`,
    ...meta.jsonLd.map(
      (block) => `<script type="application/ld+json" data-prerender="1">${ldJson(block)}</script>`,
    ),
  ];

  return tags.map((t) => `    ${t}`).join("\n");
};

const render = (template: string, meta: RouteMeta): string => {
  let html = template;

  // Strip the template's route-specific head so nothing stale survives.
  html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${text(meta.title)}</title>`);
  html = html.replace(/[ \t]*<meta[^>]+name=["']description["'][^>]*>\s*\n?/gi, "");
  html = html.replace(/[ \t]*<link[^>]+rel=["']canonical["'][^>]*>\s*\n?/gi, "");
  html = html.replace(
    /[ \t]*<meta[^>]+(?:property=["']og:[^"']*["']|name=["']twitter:[^"']*["'])[^>]*>\s*\n?/gi,
    "",
  );

  return html.replace(/<\/head>/i, `${headFor(meta)}\n  </head>`);
};

const main = () => {
  const template = readFileSync(templatePath, "utf8");

  if (ALL_ROUTE_META.length > MAX_PRERENDER_PAGES) {
    throw new Error(
      `[prerender] ${ALL_ROUTE_META.length} routes exceeds MAX_PRERENDER_PAGES (${MAX_PRERENDER_PAGES})`,
    );
  }

  let count = 0;
  for (const meta of ALL_ROUTE_META) {
    if (!meta.image.startsWith("https://")) {
      throw new Error(`[prerender] og:image must be absolute https for ${meta.path}: ${meta.image}`);
    }

    const html = render(template, meta);
    const outFile =
      meta.path === "/"
        ? join(distDir, "index.html")
        : join(distDir, meta.path.replace(/^\//, ""), "index.html");

    mkdirSync(join(outFile, ".."), { recursive: true });
    writeFileSync(outFile, html);
    count += 1;
    console.log(
      `[prerender] ${meta.path.padEnd(40)} → ${outFile.replace(`${distDir}/`, "")}  og:image=${meta.image
        .split("/")
        .pop()}`,
    );
  }

  console.log(`[prerender] emitted ${count} route HTML files`);
};

main();
