// Typed JSON-LD builders. Every page passes the output of these helpers to
// <SeoHead jsonLd={...} /> — no page hand-writes structured data, and every
// price comes from src/lib/seo/pricing.ts (the single source of truth).

import { PRICE_FACTS, ALL_PRICE_FACTS, formatGbp } from "@/lib/seo/pricing";

export const SITE_ORIGIN = "https://pixcellor.com";
export const ORG_ID = `${SITE_ORIGIN}/#organization`;
export const WEBSITE_ID = `${SITE_ORIGIN}/#website`;

export type Crumb = { name: string; path: string };

export const absUrl = (path: string): string =>
  `${SITE_ORIGIN}${path.startsWith("/") ? path : `/${path}`}`;

/** Reference to the Organization node defined on the homepage. */
export const orgRef = () => ({ "@id": ORG_ID });

export const breadcrumbs = (trail: Crumb[]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: trail.map((crumb, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: crumb.name,
    item: absUrl(crumb.path),
  })),
});

export const webPage = ({
  name,
  description,
  path,
}: {
  name: string;
  description: string;
  path: string;
}) => ({
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": `${absUrl(path)}#webpage`,
  name,
  description,
  url: absUrl(path),
  isPartOf: { "@id": WEBSITE_ID },
  inLanguage: "en-GB",
  publisher: orgRef(),
});

/** ISO date one year from today — a safe, always-fresh priceValidUntil. */
const oneYearOut = (): string => {
  const d = new Date();
  d.setFullYear(d.getFullYear() + 1);
  return d.toISOString().slice(0, 10);
};

/** Offer for a package, built entirely from PRICE_FACTS. */
export const offerFor = (slug: string) => {
  const facts = PRICE_FACTS[slug];
  if (!facts) return undefined;

  const primary = facts.monthly ?? facts.oneOff ?? facts.yearly;
  if (!primary) return undefined;

  const url = absUrl(`/packages/${slug}`);

  return {
    "@type": "Offer",
    name: facts.name,
    price: primary.amount,
    priceCurrency: "GBP",
    availability: "https://schema.org/InStock",
    url,
    priceValidUntil: oneYearOut(),
    ...(facts.monthly
      ? {
          priceSpecification: {
            "@type": "UnitPriceSpecification",
            price: facts.monthly.amount,
            priceCurrency: "GBP",
            billingDuration: "P1M",
            billingIncrement: 1,
            unitText: "MONTH",
          },
        }
      : {}),
  };
};

/** Offers for every package, in PACKAGE_DETAILS order. */
export const allPackageOffers = () =>
  ALL_PRICE_FACTS.map((facts) => {
    const offer = offerFor(facts.slug);
    return offer
      ? {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: `Pixcellor ${facts.name}`,
            url: absUrl(`/packages/${facts.slug}`),
          },
          ...offer,
        }
      : undefined;
  }).filter(Boolean);

/** "£89 - £2,469/month" — generated from real monthly prices, never typed. */
export const monthlyPriceRange = (): string => {
  const amounts = ALL_PRICE_FACTS.map((p) => p.monthly?.amount).filter(
    (n): n is number => typeof n === "number",
  );
  if (amounts.length === 0) return "";
  const lo = Math.min(...amounts);
  const hi = Math.max(...amounts);
  return lo === hi ? `${formatGbp(lo)}/month` : `${formatGbp(lo)} - ${formatGbp(hi)}/month`;
};

export type Faq = { q: string; a: string };

/** FAQPage — returns undefined for an empty list so we never emit an empty schema. */
export const faqPage = (faqs: Faq[] | undefined) => {
  if (!faqs || faqs.length === 0) return undefined;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
};

export const itemList = ({
  name,
  items,
}: {
  name: string;
  items: { name: string; url: string; description?: string }[];
}) => ({
  "@context": "https://schema.org",
  "@type": "ItemList",
  name,
  numberOfItems: items.length,
  itemListElement: items.map((item, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: item.name,
    url: item.url,
    ...(item.description ? { description: item.description } : {}),
  })),
});

/** Drops undefined entries so callers can compose conditionally. */
export const graph = (...nodes: (object | undefined)[]) => nodes.filter(Boolean) as object[];
