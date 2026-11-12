'use client';
import { useEffect, useState } from 'react';

export function Countdown({ target }: { target: string }) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const diff = now === null ? null : Math.max(0, new Date(target).getTime() - now);
  const parts: [string, number | null][] = [
    ['Days', diff === null ? null : Math.floor(diff / 86_400_000)],
    ['Hours', diff === null ? null : Math.floor(diff / 3_600_000) % 24],
    ['Minutes', diff === null ? null : Math.floor(diff / 60_000) % 60],
    ['Seconds', diff === null ? null : Math.floor(diff / 1000) % 60],
  ];
  return (
    <div className="countdown" role="timer" aria-label="Time until election day">
      {parts.map(([label, value]) => (
        <div key={label} className="countdown-cell">
          <span className="countdown-num">{value === null ? '--' : String(value).padStart(2, '0')}</span>
          <span className="countdown-label">{label}</span>
        </div>
      ))}
    </div>
  );
}
