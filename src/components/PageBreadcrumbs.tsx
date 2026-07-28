import { Link } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import type { Crumb } from "@/lib/seo/schema";

/**
 * Visible breadcrumb trail. Always pass the SAME trail used to build the
 * BreadcrumbList schema, so markup and structured data can't drift.
 * The last crumb renders as the current page.
 */
export default function PageBreadcrumbs({
  trail,
  className = "",
}: {
  trail: Crumb[];
  className?: string;
}) {
  if (trail.length === 0) return null;

  return (
    <Breadcrumb className={`text-xs text-foreground/60 ${className}`}>
      <BreadcrumbList>
        {trail.map((crumb, i) => {
          const isLast = i === trail.length - 1;
          return (
            <BreadcrumbItem key={crumb.path}>
              {isLast ? (
                <BreadcrumbPage className="text-foreground/90">{crumb.name}</BreadcrumbPage>
              ) : (
                <>
                  <BreadcrumbLink asChild>
                    <Link to={crumb.path} className="hover:text-foreground">
                      {crumb.name}
                    </Link>
                  </BreadcrumbLink>
                  <BreadcrumbSeparator />
                </>
              )}
            </BreadcrumbItem>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
