const SITE = "https://ktriphub.com";

// Allow search crawlers and point them to the sitemap.
export const dynamic = "force-static";

export default function robots() {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${SITE}/sitemap.xml`,
    host: SITE,
  };
}
