// SINGLE SOURCE OF TRUTH for what is crawlable.
//
// Add a route here and it appears in sitemap.xml, robots.txt guidance and
// llms.txt automatically — they are all generated from this registry at build
// time (see scripts/generate-crawl-assets.ts + vite.config.ts plugin).
// Never hand-edit dist/sitemap.xml or llms.txt.

import { SERVICES } from "@/data/services";
import { PACKAGE_DETAILS } from "@/data/packages";

export type ChangeFreq =
  | "always"
  | "hourly"
  | "daily"
  | "weekly"
  | "monthly"
  | "yearly"
  | "never";

export type IndexableRoute = {
  path: string;
  changefreq: ChangeFreq;
  priority: string;
};

/** Legal documents rendered by /legal/:doc (mirrors the DOCS map in src/pages/Legal.tsx). */
export const LEGAL_DOCS: { slug: string; title: string }[] = [
  { slug: "terms", title: "Terms of service" },
  { slug: "privacy", title: "Privacy policy" },
  { slug: "refund", title: "Refund policy" },
  { slug: "acceptable-use", title: "Acceptable use" },
];

/** Route prefixes that must NEVER be indexed. */
export const DENY_PATTERNS: string[] = [
  "/admin",
  "/portal",
  "/portal-login",
  "/customer-login",
  "/customer-portal",
  "/invoice/",
  "/invoices-admin",
  "/preview/",
  "/call/",
  "/meeting/",
  "/byow/edit/",
  "/s/",
  "/r/",
  "/jobs/apply",
  "/vacancy/",
  "/auth/",
  "/reset-password",
  "/unsubscribe",
  "/order-success",
  "/project-requirements",
  "/edit-request",
  "/me",
  "/candidate-portal",
];

export const isDenied = (path: string): boolean =>
  DENY_PATTERNS.some((p) => path === p || path === p.replace(/\/$/, "") || path.startsWith(p));

const STATIC_ROUTES: IndexableRoute[] = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/services", changefreq: "weekly", priority: "0.9" },
  { path: "/packages", changefreq: "weekly", priority: "0.9" },
  { path: "/portfolio", changefreq: "weekly", priority: "0.7" },
  { path: "/work", changefreq: "weekly", priority: "0.7" },
  { path: "/get-started", changefreq: "monthly", priority: "0.7" },
  { path: "/byow", changefreq: "monthly", priority: "0.7" },
  { path: "/legal", changefreq: "monthly", priority: "0.3" },
];

export const SERVICE_ROUTES: IndexableRoute[] = SERVICES.map((s) => ({
  path: `/services/${s.slug}`,
  changefreq: "monthly" as const,
  priority: "0.8",
}));

export const PACKAGE_ROUTES: IndexableRoute[] = Object.values(PACKAGE_DETAILS).map((p) => ({
  path: `/packages/${p.slug}`,
  changefreq: "monthly" as const,
  priority: "0.8",
}));

export const LEGAL_ROUTES: IndexableRoute[] = LEGAL_DOCS.map((d) => ({
  path: `/legal/${d.slug}`,
  changefreq: "monthly" as const,
  priority: "0.3",
}));

/** Every indexable route in the app, in crawl-priority order. */
export const INDEXABLE_ROUTES: IndexableRoute[] = [
  ...STATIC_ROUTES.slice(0, 3),
  ...SERVICE_ROUTES,
  ...PACKAGE_ROUTES,
  ...STATIC_ROUTES.slice(3, 7),
  STATIC_ROUTES[7],
  ...LEGAL_ROUTES,
];

export const SITE_ORIGIN = "https://pixcellor.com";
