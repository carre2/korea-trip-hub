import "./globals.css";

export const metadata = {
  title: "Korea Trip Hub — Plan your Korea trip in your language",
  description:
    "All-in-one multilingual travel hub for visiting Korea: AI trip planner, verified essentials (visa, transport), food & hands-on experiences, reviews, and K-culture.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
