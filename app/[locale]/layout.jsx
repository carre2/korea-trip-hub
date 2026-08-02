import { locales } from "../../lib/i18n";
import Header from "../../components/Header";

// Pre-render one static page per locale.
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default function LocaleLayout({ children, params }) {
  const { locale } = params;
  return (
    <>
      <Header locale={locale} />
      {children}
    </>
  );
}
