import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";

import { reportLovableError } from "../lib/lovable-error-reporting";
import { CartProvider } from "../lib/cart";
import { CartDrawer } from "../components/CartDrawer";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => {
    const siteUrl = "https://carwalhos-juice-delivery.lovable.app";
    const socialImage = `${siteUrl}/__l5e/assets-v1/1dc5ef54-be19-4f99-8b7d-bb86072c0a97/carwalhos-social.png`;
    const title = "Carwalho's Cafe - Fresh Sugarcane Juice & Tender Coconut Delivery in Chennai";
    const description = "Order fresh sugarcane juice and tender coconut water online in Pallavaram, Chennai. Hand-pressed daily, same-day delivery for homes, offices, and events.";
    return {
      meta: [
        { charSet: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { title },
        { name: "description", content: description },
        { name: "keywords", content: "sugarcane juice, tender coconut, fresh juice delivery, sugarcane juice Chennai, tender coconut Chennai, Pallavaram juice delivery, cane juice, coconut water delivery, healthy drinks Chennai, Carwalho's Cafe" },
        { name: "robots", content: "index, follow, max-image-preview:large" },
        { name: "author", content: "Carwalho's Cafe" },
        { name: "theme-color", content: "#0a1a14" },
        { property: "og:type", content: "website" },
        { property: "og:site_name", content: "Carwalho's Cafe" },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:image", content: socialImage },
        { property: "og:image:width", content: "1920" },
        { property: "og:image:height", content: "1080" },
        { property: "og:image:alt", content: "Carwalho's Cafe - Fresh Sugarcane Juice & Tender Coconut" },
        { property: "og:url", content: siteUrl },
        { property: "og:locale", content: "en_IN" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
        { name: "twitter:image", content: socialImage },
        { name: "twitter:image:alt", content: "Carwalho's Cafe - Fresh Sugarcane Juice & Tender Coconut" },
        { name: "geo.region", content: "IN-TN" },
        { name: "geo.placename", content: "Pallavaram, Chennai" },
        { title: "Carwalho's Café" },
        { property: "og:title", content: "Carwalho's Café" },
        { name: "twitter:title", content: "Carwalho's Café" },
        { name: "description", content: "Experience farm-fresh refreshment with naturally sweet sugarcane juice and handpicked tender coconuts. Freshly prepared, carefully packed, and delivered across" },
        { property: "og:description", content: "Experience farm-fresh refreshment with naturally sweet sugarcane juice and handpicked tender coconuts. Freshly prepared, carefully packed, and delivered across" },
        { name: "twitter:description", content: "Experience farm-fresh refreshment with naturally sweet sugarcane juice and handpicked tender coconuts. Freshly prepared, carefully packed, and delivered across" },
        { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/jut61odj8cgkqhvyKv4uhnkdZ6D3/social-images/social-1782435983407-Frame_15.webp" },
        { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/jut61odj8cgkqhvyKv4uhnkdZ6D3/social-images/social-1782435983407-Frame_15.webp" },
      ],
      links: [
        { rel: "stylesheet", href: appCss },
        { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
        { rel: "apple-touch-icon", href: "/favicon.png" },
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=Pinyon+Script&family=Work+Sans:wght@300;400;500;600&display=swap",
        },
      ],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            "@id": `${siteUrl}/#business`,
            name: "Carwalho's Cafe",
            description,
            url: siteUrl,
            image: socialImage,
            logo: socialImage,
            telephone: "+91-9342623521",
            email: "support@carwalhoscafe.in",
            priceRange: "₹₹",
            servesCuisine: ["Sugarcane Juice", "Tender Coconut Water", "Fresh Juices"],
            address: {
              "@type": "PostalAddress",
              addressLocality: "Pallavaram",
              addressRegion: "Tamil Nadu",
              postalCode: "600117",
              addressCountry: "IN",
            },
            areaServed: { "@type": "City", name: "Chennai" },
            openingHoursSpecification: [
              {
                "@type": "OpeningHoursSpecification",
                dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
                opens: "10:00",
                closes: "14:00",
              },
            ],
          }),
        },
      ],
    };
  },
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <CartProvider>
        {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
        <Outlet />
        <CartDrawer />
      </CartProvider>
    </QueryClientProvider>
  );
}
