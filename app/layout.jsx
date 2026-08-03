// Root layout is a passthrough: the real <html lang>/<body> live in app/[locale]/layout.jsx
// so each locale gets a correct static lang attribute (SEO). The root path "/" is redirected
// to /en/ at the edge via public/_redirects.
export const metadata = {
  title: "Korea Trip Hub — Plan your Korea trip in your language",
  description:
    "All-in-one multilingual travel hub for visiting Korea: AI trip planner, verified essentials (visa, transport), food & hands-on experiences, reviews, and K-culture.",
};

export default function RootLayout({ children }) {
  return children;
}
