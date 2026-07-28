// Single source of truth for machine-readable pricing facts.
// Everything here is DERIVED from PACKAGE_DETAILS (src/data/packages.ts) —
// never hardcode a second copy of a price. If a price changes in Stripe and in
// PACKAGE_DETAILS, every consumer of this module updates automatically.

import { PACKAGE_DETAILS, type PackageDetail } from "@/data/packages";

export type BillingPeriod = "one-off" | "month" | "year";

export type PriceFact = {
  slug: string;
  /** Package name, trimmed of the non-breaking spaces used for layout. */
  name: string;
  /** Numeric amount in major units (GBP pounds). */
  amount: number;
  currency: "GBP";
  period: BillingPeriod;
  /** Canonical display string, e.g. "£89/mo", "£169", "£890/yr". */
  display: string;
};

export type PackagePriceFacts = {
  slug: string;
  name: string;
  monthly?: PriceFact;
  yearly?: PriceFact;
  oneOff?: PriceFact;
  /** Annual saving in GBP when paying yearly instead of monthly (if any). */
  yearlySaving?: number;
};

const cleanName = (name: string) => name.replace(/\u00a0/g, "").trim();

/** Parse "£2,469/mo" / "£169.00" / "£24,690/yr" into a number. */
export const parseGbp = (value: string | undefined): number | undefined => {
  if (!value) return undefined;
  const match = value.replace(/,/g, "").match(/£\s*(\d+(?:\.\d+)?)/);
  return match ? Number(match[1]) : undefined;
};

/** Format a numeric GBP amount without trailing ".00". */
export const formatGbp = (amount: number): string =>
  `£${amount.toLocaleString("en-GB", {
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;

export const formatSaving = (amount: number): string => formatGbp(amount);

const isSubscription = (pkg: PackageDetail) => pkg.mode === "subscription";

const toFacts = (pkg: PackageDetail): PackagePriceFacts => {
  const name = cleanName(pkg.name);
  const base = parseGbp(pkg.price);
  const yearly = parseGbp(pkg.yearlyPrice);
  const recurring = isSubscription(pkg);

  const facts: PackagePriceFacts = { slug: pkg.slug, name };

  if (base !== undefined) {
    if (recurring) {
      facts.monthly = {
        slug: pkg.slug,
        name,
        amount: base,
        currency: "GBP",
        period: "month",
        display: `${formatGbp(base)}/mo`,
      };
    } else {
      facts.oneOff = {
        slug: pkg.slug,
        name,
        amount: base,
        currency: "GBP",
        period: "one-off",
        display: formatGbp(base),
      };
    }
  }

  if (yearly !== undefined) {
    facts.yearly = {
      slug: pkg.slug,
      name,
      amount: yearly,
      currency: "GBP",
      period: "year",
      display: `${formatGbp(yearly)}/yr`,
    };
    if (base !== undefined && recurring) {
      const saving = base * 12 - yearly;
      if (saving > 0) facts.yearlySaving = saving;
    }
  }

  return facts;
};

/** Price facts for every package, keyed by slug. */
export const PRICE_FACTS: Record<string, PackagePriceFacts> = Object.fromEntries(
  Object.values(PACKAGE_DETAILS).map((pkg) => [pkg.slug, toFacts(pkg)]),
);

export const ALL_PRICE_FACTS = Object.values(PRICE_FACTS);

/** Lowest one-off (non-subscription) price across all packages. */
export const getLowestOneOff = (): PriceFact | undefined =>
  ALL_PRICE_FACTS.map((p) => p.oneOff)
    .filter((p): p is PriceFact => Boolean(p))
    .sort((a, b) => a.amount - b.amount)[0];

/** Lowest recurring monthly price across all packages. */
export const getLowestMonthly = (): PriceFact | undefined =>
  ALL_PRICE_FACTS.map((p) => p.monthly)
    .filter((p): p is PriceFact => Boolean(p))
    .sort((a, b) => a.amount - b.amount)[0];

/** "from £X" copy — always generated, never typed by hand. */
export const fromOneOffLabel = (): string => {
  const p = getLowestOneOff();
  return p ? `from ${p.display}` : "";
};

export const fromMonthlyLabel = (): string => {
  const p = getLowestMonthly();
  return p ? `from ${p.display}` : "";
};
