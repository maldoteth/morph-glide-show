import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { SERVICES, SERVICE_CATEGORIES, type Service } from "@/data/services";

/**
 * Deterministic "related services" — the next 4 services in the same category
 * (wrapping around the list). Stable across renders and crawls, so link equity
 * flows predictably between service pages instead of dead-ending.
 */
export function getRelatedServices(service: Service, count = 4): Service[] {
  const inCategory = SERVICES.filter((s) => s.category === service.category);
  const start = inCategory.findIndex((s) => s.slug === service.slug);
  if (start < 0) return inCategory.slice(0, count);

  const related: Service[] = [];
  for (let i = 1; related.length < count && i < inCategory.length; i++) {
    related.push(inCategory[(start + i) % inCategory.length]);
  }
  return related;
}

export default function RelatedServices({ service }: { service: Service }) {
  const related = getRelatedServices(service);
  if (related.length === 0) return null;

  const categoryTitle = SERVICE_CATEGORIES[service.category].title;

  return (
    <section className="mt-12 md:mt-16" aria-labelledby="related-services">
      <h2
        id="related-services"
        className="text-xs uppercase tracking-[0.22em] text-foreground/50 mb-5"
      >
        Related services
      </h2>
      <ul className="grid gap-3 sm:grid-cols-2">
        {related.map((s) => (
          <li key={s.slug}>
            <Link
              to={`/services/${s.slug}`}
              className="group flex h-full flex-col gap-2 rounded-lg border border-foreground/10 bg-foreground/[0.03] p-5 backdrop-blur-md transition-colors hover:border-foreground/30 hover:bg-foreground/[0.06]"
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-base font-semibold leading-tight text-foreground/90 transition-colors group-hover:text-white">
                  {s.name}
                </h3>
                <ArrowUpRight className="h-4 w-4 shrink-0 text-foreground/40 transition-colors group-hover:text-foreground" />
              </div>
              <p className="text-sm leading-relaxed text-foreground/70">{s.tagline}</p>
            </Link>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-xs text-foreground/50">
        Browse all{" "}
        <Link to="/services" className="underline underline-offset-4 hover:text-foreground">
          {categoryTitle.toLowerCase()}
        </Link>{" "}
        or see{" "}
        <Link to="/packages" className="underline underline-offset-4 hover:text-foreground">
          our packages
        </Link>
        .
      </p>
    </section>
  );
}
