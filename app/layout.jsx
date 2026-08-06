// Root layout is a passthrough: the real <html lang>/<body> live in app/[locale]/layout.jsx
// so each locale gets a correct static lang attribute (SEO). The root path "/" is redirected
// to /en/ at the edge via public/_redirects.
export const metadata = {
  title: "Korea Trip Hub — Plan your Korea trip in your language",
  description:
    "All-in-one multilingual travel hub for visiting Korea: AI trip planner, verified essentials (visa, transport), food & hands-on experiences, reviews, and K-culture.",
  // Site-verification meta tags (rendered on every page's <head>).
  other: {
    "p:domain_verify": "20f3ec6adc3c8ed867705f6791228fe3",
  },
};

export default function RootLayout({ children }) {
  return children;
}
