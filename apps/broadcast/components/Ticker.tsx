'use client';

/** Scrolling headline strip. Duplicated content keeps the loop seamless. */
export function Ticker({ lines }: { lines: string[] }) {
  const text = lines.join('   •   ');
  return (
    <div className="ticker" role="marquee" aria-label="Live demonstration updates">
      <span className="ticker-badge">UPDATE</span>
      <div className="ticker-track">
        <span>{text}</span>
        <span aria-hidden>{text}</span>
      </div>
    </div>
  );
}
