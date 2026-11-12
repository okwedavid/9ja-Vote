'use client';
import { CSSProperties, useEffect, useState } from 'react';

export interface Slide { src: string; alt: string; title: string; text: string }

/** CSS-only 3D ring carousel. Autoplay pauses on hover/focus and is off for reduced-motion users. */
export function Carousel3D({ slides }: { slides: Slide[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const n = slides.length;
  const angle = 360 / n;
  const active = ((index % n) + n) % n;

  useEffect(() => {
    if (paused || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = setInterval(() => setIndex((i) => i + 1), 5000);
    return () => clearInterval(id);
  }, [paused]);

  return (
    <div
      className="carousel"
      role="region"
      aria-roledescription="carousel"
      aria-label="Platform highlights"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="carousel-stage">
        <div className="carousel-ring" style={{ '--turn': `${-index * angle}deg` } as CSSProperties}>
          {slides.map((s, i) => (
            <figure
              key={s.src}
              className="carousel-slide"
              data-active={i === active}
              aria-hidden={i !== active}
              style={{ '--a': `${i * angle}deg` } as CSSProperties}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={s.src} alt={s.alt} loading={i === 0 ? 'eager' : 'lazy'} decoding="async" />
              <figcaption>
                <strong>{s.title}</strong>
                <span>{s.text}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
      <div className="carousel-controls">
        <button type="button" className="carousel-btn" onClick={() => setIndex((i) => i - 1)} aria-label="Previous slide">‹</button>
        <div className="carousel-dots">
          {slides.map((s, i) => (
            <button
              key={s.src}
              type="button"
              className="carousel-dot"
              aria-label={`Show slide ${i + 1}: ${s.title}`}
              aria-current={i === active}
              onClick={() => setIndex((cur) => cur + (i - active))}
            />
          ))}
        </div>
        <button type="button" className="carousel-btn" onClick={() => setIndex((i) => i + 1)} aria-label="Next slide">›</button>
      </div>
      <p className="sr-only" aria-live="polite">{slides[active].title}</p>
    </div>
  );
}
