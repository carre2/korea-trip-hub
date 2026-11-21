"use client";
// Desktop side-gutter display ads — occupy the wide empty margins (>=1480px) that
// were freed when the video rails were removed. One AdSense responsive display unit
// per gutter, fixed in the margin and never overlapping the 1180px content column.
// Hidden below 1480px (CSS), where in-content monetization applies.
//
// Left and right use SEPARATE slots so their earnings report independently in AdSense.
// Publisher is already wired site-wide (app/[locale]/layout.jsx loads adsbygoogle.js).
// To add the right slot: create a 2nd "Display ads" unit in AdSense (size: Responsive),
// copy its slot id (the data-ad-slot digits), and paste it into AD_SLOT_RIGHT below.
// Until AD_SLOT_RIGHT is set, the right gutter reuses the left slot (no blank gutter).
import { useEffect } from "react";

const AD_CLIENT = "ca-pub-2067934281598769";
const AD_SLOT_LEFT = "8220713202"; // AdSense Display unit "ktriphub-sidebar" (left)
const AD_SLOT_RIGHT = "9250723844"; // AdSense Display unit "ktriphub-sidebar-right" (right)

export default function AdRails() {
  const left = AD_SLOT_LEFT;
  const right = AD_SLOT_RIGHT || AD_SLOT_LEFT; // reuse left slot until a right slot exists

  useEffect(() => {
    if (!left) return;
    try {
      // Activate each gutter <ins> once (skip any AdSense already filled).
      document.querySelectorAll(".ad-rail .adsbygoogle").forEach((el) => {
        if (!el.getAttribute("data-adsbygoogle-status")) {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
        }
      });
    } catch (e) {}
  }, []);

  if (!left) return null; // nothing to show until at least the left slot is configured

  const Unit = ({ side, slot }) => (
    <aside className={`ad-rail ad-rail-${side}`} aria-hidden="true">
      <ins
        className="adsbygoogle"
        style={{ display: "block", width: "100%" }}
        data-ad-client={AD_CLIENT}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </aside>
  );

  return (
    <>
      <Unit side="left" slot={left} />
      <Unit side="right" slot={right} />
    </>
  );
}
