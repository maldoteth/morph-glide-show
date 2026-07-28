// Generates sitemap.xml + llms.txt from the single route registry
// (src/lib/seo/routes.ts). Run by the vite plugin in vite.config.ts.
//
//   bun scripts/generate-crawl-assets.ts <outDir>
//
// Never hand-edit the generated files.

import { writeFileSync, mkdirSync } from "fs";
import { resolve } from "path";

import {
  INDEXABLE_ROUTES,
  LEGAL_DOCS,
  SITE_ORIGIN,
  isDenied,
} from "@/lib/seo/routes";
import { SERVICES } from "@/data/services";
import { PACKAGE_DETAILS } from "@/data/packages";
import { PRICE_FACTS, getLowestMonthly, formatGbp } from "@/lib/seo/pricing";

const outDir = process.argv[2] ?? "dist";
const today = new Date().toISOString().slice(0, 10);

const clean = (s: string) => s.replace(/\u00a0/g, "").trim();

// ── Validation ───────────────────────────────────────────────────────────────
function validate() {
  const paths = INDEXABLE_ROUTES.map((r) => r.path);
  const errors: string[] = [];

  for (const p of paths) {
    if (p !== "/" && p.endsWith("/")) errors.push(`Trailing slash in route: ${p}`);
    if (isDenied(p)) errors.push(`Route is in the deny-list but marked indexable: ${p}`);
  }

  const dupes = paths.filter((p, i) => paths.indexOf(p) !== i);
  if (dupes.length) errors.push(`Duplicate routes: ${[...new Set(dupes)].join(", ")}`);

  for (const s of SERVICES) {
    if (!paths.includes(`/services/${s.slug}`)) errors.push(`Missing service page: /services/${s.slug}`);
  }
  for (const p of Object.values(PACKAGE_DETAILS)) {
    if (!paths.includes(`/packages/${p.slug}`)) errors.push(`Missing package page: /packages/${p.slug}`);
  }
  for (const d of LEGAL_DOCS) {
    if (!paths.includes(`/legal/${d.slug}`)) errors.push(`Missing legal page: /legal/${d.slug}`);
  }

  if (errors.length) {
    console.error("\n✖ Crawl registry check failed:\n" + errors.map((e) => `  - ${e}`).join("\n") + "\n");
    process.exit(1);
  }
}

// ── sitemap.xml ──────────────────────────────────────────────────────────────
function sitemap(): string {
  const urls = INDEXABLE_ROUTES.map((r) =>
    [
      "  <url>",
      `    <loc>${SITE_ORIGIN}${r.path === "/" ? "/" : r.path}</loc>`,
      `    <lastmod>${today}</lastmod>`,
      `    <changefreq>${r.changefreq}</changefreq>`,
      `    <priority>${r.priority}</priority>`,
      "  </url>",
    ].join("\n"),
  );
  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
    ...urls,
    `</urlset>`,
    ``,
  ].join("\n");
}

// ── llms.txt ─────────────────────────────────────────────────────────────────
function llms(): string {
  const lowestMonthly = getLowestMonthly();
  const monthlyAmounts = Object.values(PRICE_FACTS)
    .map((p) => p.monthly?.amount)
    .filter((n): n is number => typeof n === "number")
    .sort((a, b) => a - b);
  const highestMonthly = monthlyAmounts[monthlyAmounts.length - 1];

  const summary =
    `Pixcellor is a UK digital agency building bespoke websites, full-stack web apps, AI agents and growth systems for businesses, ` +
    `on monthly retainers${lowestMonthly ? ` from ${lowestMonthly.display}` : ""}` +
    `${highestMonthly ? ` up to ${formatGbp(highestMonthly)}/mo` : ""}, with unlimited edits, hosting, SEO/AEO and a lifetime warranty.`;

  const pages = [
    "- [Home](/): Pixcellor overview, packages, portfolio and contact.",
    "- [Services](/services): Index of all 25 marketing, tech and business services.",
    "- [Packages](/packages): All retainers and builds with prices and comparison table.",
    "- [Portfolio](/portfolio): Selected websites, apps and brand work we have shipped.",
    "- [Work with us](/work): Open roles at Pixcellor.",
    "- [Get started](/get-started): Start a project or book a call.",
    "- [Build your own website](/byow): Self-serve AI website builder.",
    "- [Legal](/legal): Index of legal documents.",
  ];

  const services = SERVICES.map((s) => `- [${s.name}](/services/${s.slug}): ${s.info}`);

  const packages = Object.values(PACKAGE_DETAILS).map((p) => {
    const facts = PRICE_FACTS[p.slug];
    const price = facts?.monthly?.display ?? facts?.oneOff?.display ?? p.price;
    const yearly = facts?.yearly ? ` (${facts.yearly.display})` : "";
    return `- [${clean(p.name)}](/packages/${p.slug}): ${price}${yearly} — ${p.billing}. ${p.tagline}`;
  });

  const legal = LEGAL_DOCS.map((d) => `- [${d.title}](/legal/${d.slug})`);

  return [
    "# Pixcellor™",
    "",
    `> ${summary}`,
    "",
    "## Pages",
    "",
    ...pages,
    "",
    "## Services",
    "",
    ...services,
    "",
    "## Packages",
    "",
    ...packages,
    "",
    "## Legal",
    "",
    ...legal,
    "",
  ].join("\n");
}

validate();
mkdirSync(resolve(outDir), { recursive: true });
writeFileSync(resolve(outDir, "sitemap.xml"), sitemap());
writeFileSync(resolve(outDir, "llms.txt"), llms());
console.log(
  `crawl assets written to ${outDir}/ (${INDEXABLE_ROUTES.length} URLs, lastmod=${today})`,
);
