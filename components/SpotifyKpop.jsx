"use client";

import { useState } from "react";

// All IDs verified via Spotify oEmbed (title matched the act). See HARNESS: no invented IDs.
// Ordered roughly by overseas popularity (Spotify reach / Hallyu survey), per research.
const ARTISTS = [
  { id: "3Nrfpe0tUJi4K4DXYWgMUX", name: "BTS" },
  { id: "2dIgFjalVxs4ThymZ67YCE", name: "Stray Kids" },
  { id: "7nqOGRxlXj7N2JYbgNEjYH", name: "SEVENTEEN" },
  { id: "0ghlgldX5Dd6720Q3qFyQB", name: "TOMORROW X TOGETHER" },
  { id: "41MozSoPIsD1dJM0CLPjZF", name: "BLACKPINK" },
  { id: "7n2Ycct7Beij7Dj7meI4X0", name: "TWICE" },
  { id: "6RHTUrRF63xao58xh9FXYJ", name: "IVE" },
  { id: "4SpbR6yFEvexJuaBpgAU5p", name: "LE SSERAFIM" },
  { id: "6YVMFz59CuY7ngCxTxjpxE", name: "aespa" },
  { id: "6HvZYsbFfjnjFrWF950C9d", name: "NewJeans" },
  { id: "2KC9Qb60EaY0kW4eH68vr3", name: "ITZY" },
  { id: "2AfmfGFbe0A0WsTYm0SDTx", name: "i-dle" },
  { id: "3HqSLMAZ3g3d5poNaI7GOU", name: "IU" },
  { id: "1oSPZhvZMIrWW5I41kPkkY", name: "Jimin" },
];
const PLAYLISTS = [
  { id: "37i9dQZF1DX9tPFwDMOaN1", name: "K-Pop ON! (온)" },
  { id: "37i9dQZF1DX14fiWYoe7Oh", name: "K-Pop Generations" },
];

export default function SpotifyKpop({ labels }) {
  const t = labels || {};
  const [sel, setSel] = useState({ type: "artist", ...ARTISTS[0] });

  const src = `https://open.spotify.com/embed/${sel.type}/${sel.id}?utm_source=generator`;

  return (
    <div className="spotify-wrap">
      <div className="spo-picker">
        <div className="spo-label">🎤 {t.artists || "Artists & groups"}</div>
        <div className="chips">
          {ARTISTS.map((a) => (
            <button
              key={a.id}
              className="chip"
              aria-pressed={sel.type === "artist" && sel.id === a.id}
              onClick={() => setSel({ type: "artist", ...a })}
            >{a.name}</button>
          ))}
        </div>
        <div className="spo-label" style={{ marginTop: 14 }}>💿 {t.playlists || "Curated playlists"}</div>
        <div className="chips">
          {PLAYLISTS.map((p) => (
            <button
              key={p.id}
              className="chip"
              aria-pressed={sel.type === "playlist" && sel.id === p.id}
              onClick={() => setSel({ type: "playlist", ...p })}
            >{p.name}</button>
          ))}
        </div>
      </div>

      <div className="spo-player">
        <iframe
          title={`Spotify — ${sel.name}`}
          src={src}
          width="100%"
          height="420"
          style={{ border: 0, borderRadius: 14 }}
          loading="lazy"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        />
        <p className="spo-note">{t.note || "Free 30-second previews; full tracks with a Spotify login."}</p>
      </div>
    </div>
  );
}
