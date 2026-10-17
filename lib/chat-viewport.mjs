// Keep the composer inside the visible area, including keyboard-induced panning.
export function chatViewport({ mobile, height, offsetTop = 0 }) {
  if (!mobile) return null;
  return {
    compact: height < 500,
    style: { top: offsetTop + 8, bottom: 'auto', height: Math.max(0, Math.min(720, height - 16)), maxHeight: 'none' },
  };
}
