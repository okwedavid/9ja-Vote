import { SiteFooter, SiteHeader } from '../../components/SiteChrome';

export const metadata = { title: 'Accessibility — 9ja Vote' };

export default function AccessibilityPage() {
  return (
    <>
      <SiteHeader />
      <main id="main">
        <section className="page-hero on-dark">
          <div className="container">
            <p className="eyebrow">Accessibility</p>
            <h1>Built for every Nigerian</h1>
            <p className="lead">
              Large touch targets, readable type, keyboard support and a reduced-motion mode. Accessibility is a
              requirement here, not a finishing touch.
            </p>
          </div>
        </section>
        <section className="section" style={{ paddingTop: '1rem' }}>
          <div className="container grid-2">
            <div className="card">
              <p className="eyebrow">Target</p>
              <h2 style={{ fontSize: '1.4rem' }}>WCAG 2.2 level AA</h2>
              <ul className="step-list">
                <li>Every interactive control reachable by keyboard, with a visible focus ring.</li>
                <li>Colour is never the only signal: statuses always carry a word as well.</li>
                <li>Text scales with the browser without cutting off content.</li>
                <li>Animations stop when the operating system asks for reduced motion.</li>
                <li>Buttons are at least 48 pixels tall on touch devices.</li>
                <li>Pages are lightweight so they work on slow connections and older phones.</li>
              </ul>
            </div>
            <div className="card">
              <p className="eyebrow">Honest gaps</p>
              <h2 style={{ fontSize: '1.4rem' }}>What is not done yet</h2>
              <ul className="step-list">
                <li>No independent screen-reader audit has been run yet.</li>
                <li>Contrast has been designed to AA but not measured on every surface.</li>
                <li>Nigerian Sign Language video is not available.</li>
                <li>The mobile app has not been tested with TalkBack or VoiceOver.</li>
              </ul>
              <p className="muted" style={{ fontSize: '0.9rem', marginBottom: 0 }}>
                Reporting a barrier is how these gaps close. Until a support channel is configured, treat this list as
                the known-issues register.
              </p>
            </div>
            <div className="card" style={{ gridColumn: '1 / -1' }}>
              <p className="eyebrow">Also true</p>
              <div className="grid-3">
                {[
                  ['No colour-only meaning', 'Status chips show text such as “Verified” or “Disputed”.'],
                  ['No autoplay audio', 'Nothing on this site plays sound.'],
                  ['No flashing content', 'Nothing flashes faster than three times per second.'],
                ].map(([title, text]) => (
                  <div key={title}>
                    <h3 style={{ fontSize: '1rem' }}>{title}</h3>
                    <p className="muted" style={{ fontSize: '0.9rem', margin: 0 }}>
                      {text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
