"use client";
// Desktop side-gutter display ads — occupy the wide empty margins (>=1480px) that
// were freed when the video rails were removed. One AdSense responsive display unit
// per gutter, fixed in the margin and never overlapping the 1180px content column.
// Hidden below 1480px (CSS), where in-content monetization applies.
//
// Publisher is already wired site-wide (app/[locale]/layout.jsx loads adsbygoogle.js).
// To activate: create ONE "Display ads" unit in AdSense (size: Responsive), copy its
// slot id (the data-ad-slot digits), and paste it into AD_SLOT below. Until a slot id
// is set this renders nothing, so the component is safe to ship un-activated.
import { useEffect } from "react";

const AD_CLIENT = "ca-pub-2067934281598769";
const AD_SLOT = "8220713202"; // AdSense Display unit "ktriphub-sidebar"

export default function AdRails() {
  useEffect(() => {
    if (!AD_SLOT) return;
    try {
      // Activate each gutter <ins> once (skip any AdSense already filled).
      document.querySelectorAll(".ad-rail .adsbygoogle").forEach((el) => {
        if (!el.getAttribute("data-adsbygoogle-status")) {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
        }
      });
    } catch (e) {}
  }, []);

  if (!AD_SLOT) return null; // nothing to show until a slot id is configured

  const Unit = ({ side }) => (
    <aside className={`ad-rail ad-rail-${side}`} aria-hidden="true">
      <ins
        className="adsbygoogle"
        style={{ display: "block", width: "100%" }}
        data-ad-client={AD_CLIENT}
        data-ad-slot={AD_SLOT}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </aside>
  );

  return (
    <>
      <Unit side="left" />
      <Unit side="right" />
    </>
  );
}
