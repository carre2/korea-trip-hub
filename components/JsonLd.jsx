// Renders schema.org JSON-LD. Accepts one node or an array; nulls are dropped so a page can
// pass e.g. faqLd(...) unconditionally and get nothing when there is no FAQ to describe.
export default function JsonLd({ data }) {
  const nodes = (Array.isArray(data) ? data : [data]).filter(Boolean);
  if (!nodes.length) return null;
  return (
    <>
      {nodes.map((node, i) => (
        <script
          key={i}
          type="application/ld+json"
          // "<" is escaped so a "</script>" inside any content string can't close the tag early.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(node).replace(/</g, "\\u003c") }}
        />
      ))}
    </>
  );
}
