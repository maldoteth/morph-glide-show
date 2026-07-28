// Titles/intros for the legal documents, kept separate from the page component
// so build-time prerendering can import them without pulling in React/JSX.

export type LegalDocMeta = { slug: string; title: string; intro: string };

export const LEGAL_DOCS_META: LegalDocMeta[] = [
  { slug: "terms", title: "Terms of Service", intro: "The legal agreement between you and Pixcellor." },
  { slug: "privacy", title: "Privacy Policy", intro: "How we collect, use and protect personal data." },
  { slug: "refund", title: "Refund Policy", intro: "Our 28-day satisfaction guarantee and refund rules." },
  {
    slug: "acceptable-use",
    title: "Acceptable Use Policy",
    intro: "What you can and cannot do with our Services.",
  },
];

export const legalDocMeta = (slug: string): LegalDocMeta | undefined =>
  LEGAL_DOCS_META.find((d) => d.slug === slug);

/** Exact strings SeoHead uses on /legal and /legal/:doc — reused by the prerenderer. */
export const legalSeo = (slug?: string) => {
  const doc = slug ? legalDocMeta(slug) : undefined;
  return {
    title: doc
      ? `${doc.title} · Pixcellor™`
      : "Legal · Terms, Privacy, Refunds & Acceptable Use · Pixcellor™",
    description: doc
      ? `${doc.title} for Pixcellor — ${doc.intro}`
      : "Pixcellor's Terms of Service, Privacy Policy, Refund Policy and Acceptable Use Policy in one place.",
  };
};
