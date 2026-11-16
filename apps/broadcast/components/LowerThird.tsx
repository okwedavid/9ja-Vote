'use client';

import { useEffect, useState } from 'react';
import { ResultsPayload } from '@9ja-vote/shared-types';
import { Emblem } from './Emblem';

const fmt = new Intl.NumberFormat('en-NG');

/**
 * Lower-third overlay for OBS: put this on a browser source above the camera.
 * `?mode=lower-third` renders nothing else, so the overlay stays transparent.
 */
export function LowerThird({ initial }: { initial: ResultsPayload }) {
  const [data, setData] = useState(initial);
  const [scale, setScale] = useState(1);
  const [clock, setClock] = useState('');

  useEffect(() => {
    const fit = () => setScale(Math.min(window.innerWidth / 1920, window.innerHeight / 1080));
    fit();
    window.addEventListener('resize', fit);
    const tick = setInterval(
      () => setClock(new Date().toLocaleTimeString('en-NG', { timeZone: 'Africa/Lagos', hour12: false })),
      1000,
    );
    const poll = setInterval(async () => {
      try {
        const res = await fetch('/api/v1/results/national', { cache: 'no-store' });
        if (res.ok) setData((await res.json()) as ResultsPayload);
      } catch {
        /* keep the last good figure on screen */
      }
    }, 10_000);
    return () => {
      window.removeEventListener('resize', fit);
      clearInterval(tick);
      clearInterval(poll);
    };
  }, []);

  const leading = data.summary.totals[0];
  const party = data.parties.find((p) => p.id === leading?.partyId);

  return (
    <div className="frame" data-transparent="true">
      <div className="canvas canvas-overlay" style={{ transform: `scale(${scale})` }}>
        <div className="lower-third">
          <Emblem size={64} />
          <div className="lt-text">
            <strong>9ja Vote Live · Demonstration</strong>
            <span>
              {party ? `${party.name} leads the figures received` : 'Awaiting figures'} ·{' '}
              {data.summary.statesReporting}/{data.summary.statesTotal} states reporting
            </span>
          </div>
          <div className="lt-right">
            <span className="lt-pct">{leading ? `${(leading.share * 100).toFixed(1)}%` : '—'}</span>
            <span className="lt-meta">{fmt.format(leading?.votes ?? 0)} votes · {clock} WAT</span>
          </div>
        </div>
        <p className="lt-note">Synthetic demonstration data. Not official results. No winner is declared by this platform.</p>
      </div>
    </div>
  );
}
