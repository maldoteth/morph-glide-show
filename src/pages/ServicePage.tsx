import { useEffect } from "react";
import { Link, useParams, Navigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import SeoHead from "@/components/SeoHead";
import Footer from "@/components/Footer";
import PageBreadcrumbs from "@/components/PageBreadcrumbs";
import ServiceSalesView from "@/components/services/ServiceSalesView";
import RelatedServices from "@/components/services/RelatedServices";
import LetsTalkPrompt from "@/components/LetsTalkPrompt";
import PackagesDialog from "@/components/PackagesDialog";
import VisionGenerator from "@/components/VisionGenerator";
import { getServiceBySlug } from "@/data/services";
import { SERVICE_SEO } from "@/data/serviceSeo";
import { OG_SERVICE_BY_SLUG, OG_SERVICES } from "@/data/ogImages";
import { breadcrumbs, faqPage, graph, orgRef, webPage, type Crumb } from "@/lib/seo/schema";

export default function ServicePage() {
  const { slug = "" } = useParams();
  const service = getServiceBySlug(slug);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [slug]);

  if (!service) return <Navigate to="/services" replace />;

  const path = `/services/${service.slug}`;
  const url = `https://pixcellor.com${path}`;
  const seo = SERVICE_SEO[service.slug];
  const seoTitle = seo?.title ?? `${service.name} — Pixcellor`;
  const seoDescription = seo?.description ?? service.tagline;

  const trail: Crumb[] = [
    { name: "Home", path: "/" },
    { name: "Services", path: "/services" },
    { name: service.name, path },
  ];

  const serviceLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.name,
    serviceType: service.name,
    description: service.heroBlurb,
    url,
    provider: orgRef(),
    areaServed: [
      { "@type": "Country", name: "United Kingdom" },
      { "@type": "Place", name: "Worldwide" },
    ],
    ...(seo?.keywords ? { keywords: seo.keywords.join(", ") } : {}),
    ...(service.pricing
      ? {
          offers: {
            "@type": "Offer",
            description: service.pricing,
            priceCurrency: "GBP",
            url,
          },
        }
      : {}),
  };

  // FAQ schema only when the same FAQs actually render on the page.
  const faqLd = faqPage(service.faqs);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SeoHead
        title={seoTitle}
        description={seoDescription}
        path={path}
        image={OG_SERVICE_BY_SLUG[service.slug] ?? OG_SERVICES}
        jsonLd={graph(
          webPage({ name: seoTitle, description: seoDescription, path }),
          serviceLd,
          breadcrumbs(trail),
          faqLd,
        )}
      />



      <header className="sticky top-0 z-30 border-b border-foreground/10 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-3 md:px-10">
          <Link
            to="/"
            className="flex items-center gap-2 text-sm font-semibold tracking-tight hover:opacity-80"
          >
            <ArrowLeft className="h-4 w-4" />
            Pixcellor™
          </Link>
          <Link
            to="/services"
            className="text-xs uppercase tracking-wider text-foreground/70 hover:text-foreground"
          >
            All services
          </Link>
        </div>
      </header>

      <main>
        <ServiceSalesView service={service} />
      </main>

      <Footer />

      {/* Mounted so CTAs work on this standalone route */}
      <LetsTalkPrompt />
      <PackagesDialog hidden />
      <VisionGenerator hidden />
    </div>
  );
}
