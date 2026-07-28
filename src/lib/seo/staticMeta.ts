// SINGLE SOURCE OF TRUTH for the head of every indexable route.
//
// Both the runtime <SeoHead> (via the page components that import from here)
// and the build-time prerenderer (scripts/prerender.ts) read this module, so
// the static HTML a social crawler sees can never disagree with the client.
//
// No React / JSX may be imported here — this file is loaded by a plain script.

import { SERVICES } from "@/data/services";
import { PACKAGE_DETAILS } from "@/data/packages";
import { SERVICE_SEO } from "@/data/serviceSeo";
import { LEGAL_DOCS_META, legalSeo } from "@/data/legalDocsMeta";
import {
  OG_DEFAULT,
  OG_GET_STARTED,
  OG_HOME,
  OG_LEGAL,
  OG_LEGAL_BY_SLUG,
  OG_PACKAGES,
  OG_PACKAGE_BY_SLUG,
  OG_PORTFOLIO,
  OG_SERVICES,
  OG_SERVICE_BY_SLUG,
} from "@/data/ogImages";
import { PRICE_FACTS, getLowestMonthly } from "@/lib/seo/pricing";
import {
  ORG_ID,
  absUrl,
  allPackageOffers,
  breadcrumbs,
  faqPage,
  graph,
  itemList,
  monthlyPriceRange,
  offerFor,
  orgRef,
  webPage,
  type Crumb,
} from "@/lib/seo/schema";
import { INDEXABLE_ROUTES } from "@/lib/seo/routes";

export type RouteMeta = {
  path: string;
  title: string;
  description: string;
  image: string;
  jsonLd: object[];
};

const price = (slug: string, key: "monthly" | "yearly" | "oneOff") =>
  PRICE_FACTS[slug]?.[key]?.display ?? "";

const lowestMonthly = () => getLowestMonthly()?.display.replace("/mo", "/month") ?? "";

// ── Core page copy ───────────────────────────────────────────────────────────
export const HOME_TITLE = "UK Web Design & App Development Agency | Pixcellor";
export const HOME_DESCRIPTION =
  "Bespoke websites, web apps and AI automation for UK businesses. Always-on retainers from £89/month, lifetime warranty, live in days — not months.";

export const SERVICES_TITLE = "Web, App, AI & Growth Services | Pixcellor";
export const SERVICES_DESCRIPTION =
  "25 services across web, apps, AI, marketing and operations — from £22/hr telesales to full-stack builds and fractional CTO retainers.";

export const PACKAGES_TITLE = () =>
  `Website Packages & Prices — From ${lowestMonthly()} | Pixcellor`;
export const PACKAGES_DESCRIPTION = () =>
  `Compare Pixcellor retainers: Growth ${price("retainer-growth", "monthly")}, Scale ${price(
    "retainer-scale",
    "monthly",
  )} and Enterprise ${price("retainer-enterprise", "monthly")}. No hidden fees, cancel anytime.`;

export const PORTFOLIO_TITLE = "Portfolio — Websites & Apps We've Built | Pixcellor";
export const PORTFOLIO_DESCRIPTION =
  "Real Pixcellor builds: animated brand sites, Web3 platforms, SaaS dashboards and e-commerce stores for UK and international clients.";

export const GET_STARTED_TITLE = "Get Started — AI Websites in 24 Hours | Pixcellor";
export const GET_STARTED_DESCRIPTION = () =>
  `Book a free 15-minute call with Pixcellor. AI-powered websites, chatbots and apps for UK businesses. From ${lowestMonthly()}. Live in 24 hours.`;

export const WORK_TITLE = "Careers & Live Vacancies | Pixcellor";
export const WORK_DESCRIPTION =
  "Open roles at Pixcellor and live vacancies we're hiring for across tech, sales, recruitment and construction. Apply online in minutes.";

export const BYOW_TITLE = "Build your own website — managed by Pixcellor™";
export const BYOW_DESCRIPTION =
  "Pick a plan, chat your changes, watch us ship them in hours. Managed hosting, AI lead-gen, and human builders. From £100/month.";

// ── Homepage JSON-LD ─────────────────────────────────────────────────────────
const professionalServiceLd = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  "@id": ORG_ID,
  name: "Pixcellor™",
  url: "https://pixcellor.com/",
  description: HOME_DESCRIPTION,
  priceRange: monthlyPriceRange(),
  areaServed: { "@type": "Country", name: "United Kingdom" },
  serviceType: [
    "Web design",
    "Web application development",
    "Mobile app development",
    "AI automation",
    "SEO, AEO & GEO",
    "Branding and creative direction",
  ],
  knowsAbout: [
    "Website design and development",
    "React and TypeScript web apps",
    "AI agents and chatbots",
    "Search engine and answer engine optimisation",
    "E-commerce stores",
    "Lead generation and telesales",
    "Blockchain and Web3 integrations",
  ],
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Pixcellor packages",
    itemListElement: allPackageOffers(),
  },
};

const homeFaqLd = faqPage([
  {
    q: "How much does a Pixcellor retainer cost?",
    a: `Growth is ${price("retainer-growth", "monthly")}, Scale is ${price(
      "retainer-scale",
      "monthly",
    )} and Enterprise is ${price("retainer-enterprise", "monthly")}, all billed monthly.`,
  },
  {
    q: "Can I pay yearly instead of monthly?",
    a: `Yes. Yearly billing is ${price("retainer-growth", "yearly")} for Growth, ${price(
      "retainer-scale",
      "yearly",
    )} for Scale and ${price("retainer-enterprise", "yearly")} for Enterprise.`,
  },
  {
    q: "Can I cancel a retainer at any time?",
    a: "Growth and Scale are billed monthly and can be cancelled at any time. Enterprise runs on 30 days' notice.",
  },
]);

export const HOME_JSON_LD = graph(
  professionalServiceLd,
  webPage({ name: HOME_TITLE, description: HOME_DESCRIPTION, path: "/" }),
  breadcrumbs([{ name: "Home", path: "/" }]),
  homeFaqLd,
);

// ── Per-route meta ───────────────────────────────────────────────────────────
const home: Crumb = { name: "Home", path: "/" };

export const packageSeoDescription = (slug: string): string => {
  const pkg = PACKAGE_DETAILS[slug];
  return `${pkg.tagline} ${pkg.name.trim()} from Pixcellor — ${pkg.price}, ${pkg.billing.toLowerCase()}.`;
};

export const packageSeoTitle = (slug: string): string => {
  const pkg = PACKAGE_DETAILS[slug];
  return `${pkg.name} — ${pkg.price} | Pixcellor`;
};

export const serviceSeoTitle = (slug: string): string => {
  const svc = SERVICES.find((s) => s.slug === slug)!;
  return SERVICE_SEO[slug]?.title ?? `${svc.name} — Pixcellor`;
};

export const serviceSeoDescription = (slug: string): string => {
  const svc = SERVICES.find((s) => s.slug === slug)!;
  return SERVICE_SEO[slug]?.description ?? svc.tagline;
};

const serviceMeta = (slug: string): RouteMeta => {
  const svc = SERVICES.find((s) => s.slug === slug)!;
  const path = `/services/${slug}`;
  const title = serviceSeoTitle(slug);
  const description = serviceSeoDescription(slug);
  const seo = SERVICE_SEO[slug];

  const serviceLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: svc.name,
    serviceType: svc.name,
    description: svc.heroBlurb,
    url: absUrl(path),
    provider: orgRef(),
    areaServed: [
      { "@type": "Country", name: "United Kingdom" },
      { "@type": "Place", name: "Worldwide" },
    ],
    ...(seo?.keywords ? { keywords: seo.keywords.join(", ") } : {}),
    ...(svc.pricing
      ? {
          offers: {
            "@type": "Offer",
            description: svc.pricing,
            priceCurrency: "GBP",
            url: absUrl(path),
          },
        }
      : {}),
  };

  return {
    path,
    title,
    description,
    image: OG_SERVICE_BY_SLUG[slug] ?? OG_SERVICES,
    jsonLd: graph(
      webPage({ name: title, description, path }),
      serviceLd,
      breadcrumbs([home, { name: "Services", path: "/services" }, { name: svc.name, path }]),
      faqPage(svc.faqs),
    ),
  };
};

const packageMeta = (slug: string): RouteMeta => {
  const pkg = PACKAGE_DETAILS[slug];
  const path = `/packages/${slug}`;
  const title = packageSeoTitle(slug);
  const description = packageSeoDescription(slug);
  const offer = offerFor(slug);

  const productLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `Pixcellor ${pkg.name.trim()}`,
    description,
    url: absUrl(path),
    brand: orgRef(),
    ...(offer ? { offers: offer } : {}),
  };

  return {
    path,
    title,
    description,
    image: OG_PACKAGE_BY_SLUG[slug] ?? OG_PACKAGES,
    jsonLd: graph(
      webPage({ name: title, description, path }),
      productLd,
      breadcrumbs([home, { name: "Packages", path: "/packages" }, { name: pkg.name.trim(), path }]),
    ),
  };
};

const legalMeta = (slug?: string): RouteMeta => {
  const path = slug ? `/legal/${slug}` : "/legal";
  const { title, description } = legalSeo(slug);
  const doc = LEGAL_DOCS_META.find((d) => d.slug === slug);
  const trail: Crumb[] = [home, { name: "Legal", path: "/legal" }];
  if (doc) trail.push({ name: doc.title, path });

  return {
    path,
    title,
    description,
    image: (slug ? OG_LEGAL_BY_SLUG[slug] : undefined) ?? OG_LEGAL,
    jsonLd: graph(webPage({ name: title, description, path }), breadcrumbs(trail)),
  };
};

const simple = (
  path: string,
  title: string,
  description: string,
  image: string,
  crumbName: string,
  extra?: object,
): RouteMeta => ({
  path,
  title,
  description,
  image,
  jsonLd: graph(
    webPage({ name: title, description, path }),
    breadcrumbs([home, { name: crumbName, path }]),
    extra,
  ),
});

const servicesItemList = itemList({
  name: "Pixcellor services",
  items: SERVICES.map((s) => ({
    name: s.name,
    url: absUrl(`/services/${s.slug}`),
    description: s.info,
  })),
});

const packagesItemList = itemList({
  name: "Pixcellor packages",
  items: Object.values(PACKAGE_DETAILS).map((p) => ({
    name: p.name.trim(),
    url: absUrl(`/packages/${p.slug}`),
    description: p.tagline,
  })),
});

/** Head metadata for every indexable route, keyed by path. */
export const ROUTE_META: Record<string, RouteMeta> = (() => {
  const entries: RouteMeta[] = [
    {
      path: "/",
      title: HOME_TITLE,
      description: HOME_DESCRIPTION,
      image: OG_HOME,
      jsonLd: HOME_JSON_LD,
    },
    simple("/services", SERVICES_TITLE, SERVICES_DESCRIPTION, OG_SERVICES, "Services", servicesItemList),
    simple(
      "/packages",
      PACKAGES_TITLE(),
      PACKAGES_DESCRIPTION(),
      OG_PACKAGES,
      "Packages",
      packagesItemList,
    ),
    simple("/portfolio", PORTFOLIO_TITLE, PORTFOLIO_DESCRIPTION, OG_PORTFOLIO, "Portfolio"),
    simple("/work", WORK_TITLE, WORK_DESCRIPTION, OG_DEFAULT, "Work"),
    simple("/get-started", GET_STARTED_TITLE, GET_STARTED_DESCRIPTION(), OG_GET_STARTED, "Get started"),
    simple("/byow", BYOW_TITLE, BYOW_DESCRIPTION, OG_DEFAULT, "Build your own website"),
    legalMeta(),
    ...SERVICES.map((s) => serviceMeta(s.slug)),
    ...Object.values(PACKAGE_DETAILS).map((p) => packageMeta(p.slug)),
    ...LEGAL_DOCS_META.map((d) => legalMeta(d.slug)),
  ];
  return Object.fromEntries(entries.map((e) => [e.path, e]));
})();

/** Meta for every route in the crawl registry, in registry order. */
export const ALL_ROUTE_META: RouteMeta[] = INDEXABLE_ROUTES.map((r) => {
  const meta = ROUTE_META[r.path];
  if (!meta) throw new Error(`[staticMeta] No head metadata defined for indexable route: ${r.path}`);
  return meta;
});
