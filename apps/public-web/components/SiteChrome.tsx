import Link from 'next/link';
import { Emblem } from './Emblem';
import { LOCALES } from '../lib/i18n';

const links = [
  ['/elections', 'Calendar'],
  ['/results', 'Results'],
  ['/parties', 'Parties'],
  ['/voter-education', 'Learn'],
  ['/polling-units', 'Polling units'],
  ['/help', 'Help'],
];

export function SiteHeader({ current }: { current?: string }) {
  return (
    <header className="site-header on-dark">
      <div className="container header-inner">
        <Link href="/" className="brand">
          <Emblem />
          <span>9ja&nbsp;Vote</span>
        </Link>
        <nav aria-label="Primary">
          {links.map(([href, label]) => (
            <Link key={href} href={href} aria-current={current === href ? 'page' : undefined}>
              {label}
            </Link>
          ))}
        </nav>
        <label className="lang">
          <span className="sr-only">Language</span>
          <select defaultValue="en" aria-label="Language">
            {LOCALES.map((l) => (
              <option key={l.code} value={l.code} disabled={!l.ready}>
                {l.label}
                {l.ready ? '' : ' (in translation)'}
              </option>
            ))}
          </select>
        </label>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer on-dark">
      <div className="container stack">
        <div className="footer-inner">
          <div className="brand">
            <Emblem size={36} />
            <span>9ja Vote</span>
          </div>
          <p>
            Independent demonstration project. Not an INEC platform and not an authorised voting system. The emblem is
            provisional and is not the Nigerian Coat of Arms. Photographs are AI-generated illustrations.
          </p>
        </div>
        <nav className="footer-links" aria-label="Footer">
          <Link href="/help">Help &amp; FAQ</Link>
          <Link href="/help#sources">Sources</Link>
          <Link href="/accessibility">Accessibility</Link>
          <Link href="/privacy">Privacy &amp; security</Link>
          <Link href="/help#languages">Languages</Link>
        </nav>
      </div>
    </footer>
  );
}
