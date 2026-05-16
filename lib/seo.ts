import type { Metadata } from "next";

export const SITE_URL =
  typeof process.env.NEXT_PUBLIC_SITE_URL === "string" && process.env.NEXT_PUBLIC_SITE_URL
    ? process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "")
    : "https://www.shelfieease.app";

export const SITE_NAME = "ShelfieEase";

export const DEFAULT_TITLE =
  "ShelfieEase — Book Scanner & Shelf Tracker for BookTok";

export const DEFAULT_DESCRIPTION =
  "Scan your bookshelf by ISBN, avoid duplicate buys, organize your TBR, and share a TikTok-ready 9:16 shelfie. No app download. No sign-up. Free up to 10 books.";

export const KEYWORDS = [
  "ShelfieEase",
  "booktok shelf tracker",
  "booktok app",
  "ISBN scanner",
  "book barcode scanner",
  "physical bookshelf tracker",
  "TBR organizer",
  "goodreads alternative booktok",
  "shelfie card",
  "booktok creator tools",
  "boektok",
  "boeken scanner",
  "boekenkast app",
];

export const SOCIAL = {
  tiktok: "https://www.tiktok.com/@shelfieease",
  instagram: "https://www.instagram.com/shelfieease/",
};

export function absoluteUrl(path = "/"): string {
  if (path.startsWith("http")) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export function buildPageMetadata(opts: {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
}): Metadata {
  const url = absoluteUrl(opts.path);
  return {
    title: opts.title,
    description: opts.description,
    keywords: opts.keywords ?? KEYWORDS,
    alternates: { canonical: url },
    openGraph: {
      title: opts.title,
      description: opts.description,
      url: opts.path,
      siteName: SITE_NAME,
      type: "website",
      locale: "en_US",
      alternateLocale: ["nl_NL"],
      images: [
        {
          url: "/opengraph-image",
          width: 1200,
          height: 630,
          alt: opts.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: opts.title,
      description: opts.description,
      images: ["/opengraph-image"],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
  };
}

export const homeMetadata = buildPageMetadata({
  title: DEFAULT_TITLE,
  description: DEFAULT_DESCRIPTION,
  path: "/",
});

export function buildJsonLdGraph(extra: Record<string, unknown>[] = []) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: SITE_NAME,
        url: SITE_URL,
        logo: absoluteUrl("/icons/v2/android-chrome-512x512.png"),
        sameAs: [SOCIAL.tiktok, SOCIAL.instagram],
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: SITE_NAME,
        description: DEFAULT_DESCRIPTION,
        publisher: { "@id": `${SITE_URL}/#organization` },
        inLanguage: ["en", "nl"],
      },
      {
        "@type": "SoftwareApplication",
        "@id": `${SITE_URL}/#app`,
        name: SITE_NAME,
        applicationCategory: "LifestyleApplication",
        operatingSystem: "Web Browser",
        browserRequirements: "Requires JavaScript. Works on modern mobile browsers.",
        description: DEFAULT_DESCRIPTION,
        url: SITE_URL,
        offers: [
          {
            "@type": "Offer",
            price: "0",
            priceCurrency: "EUR",
            description: "Free up to 10 books",
          },
          {
            "@type": "Offer",
            price: "4.99",
            priceCurrency: "EUR",
            description: "Lifetime unlimited books and shelves",
          },
        ],
        featureList: [
          "ISBN barcode scanning in browser",
          "Custom shelves with emoji",
          "TBR, Reading, and Finished status",
          "9:16 TikTok and Reels shelfie card",
          "No account or app download required",
          "Local-first privacy (data stays in browser)",
        ],
        audience: {
          "@type": "Audience",
          audienceType: "BookTok creators, bookstagrammers, and physical book collectors",
        },
      },
      ...extra,
    ],
  };
}

export function buildFaqJsonLd(
  faqs: { q: string; a: string }[]
): Record<string, unknown> {
  return {
    "@type": "FAQPage",
    "@id": `${SITE_URL}/#faq`,
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.a,
      },
    })),
  };
}
