// Root 404. The root layout is a passthrough (no <html>), so this page renders its own.
export default function NotFound() {
  return (
    <html lang="en">
      <body style={{ fontFamily: "Arial, sans-serif", padding: 40 }}>
        <p>Page not found. <a href="/en/">Go to Korea Trip Hub →</a></p>
      </body>
    </html>
  );
}
