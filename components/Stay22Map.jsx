// Stay22 hotel map (server component). Renders an address-based Stay22 embed that
// aggregates Booking.com / Hotels.com / Airbnb around a place, earning affiliate
// commission. GATED: returns null until STAY22.aid is set in lib/booking.js, so no
// third-party iframe loads while it's unconfigured (keeps the current privacy /
// AdSense-review posture unchanged). Set the aid to switch every map on at once.
import { stay22Embed } from "../lib/booking";

export default function Stay22Map({ place, heading }) {
  const src = stay22Embed(place);
  if (!src) return null; // inert until Stay22 affiliate id is configured
  return (
    <section className="stay22" aria-label={heading || "Hotels nearby"}>
      {heading && <h2>🏨 {heading}</h2>}
      <div className="stay22-frame">
        <iframe
          src={src}
          title={heading || "Hotels nearby"}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allow="fullscreen"
        />
      </div>
      <p className="bookcta-disc">ⓘ Hotel prices via Stay22 partners — you never pay more.</p>
    </section>
  );
}
