import Link from 'next/link';
import { notFound } from 'next/navigation';
import { VOTER_EDUCATION } from '@9ja-vote/shared-types';
import { SiteFooter, SiteHeader } from '../../../components/SiteChrome';
import { apiGet } from '../../../lib/api';

export const dynamic = 'force-dynamic';

type Article = (typeof VOTER_EDUCATION)[number];

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const fallback = VOTER_EDUCATION.find((a) => a.slug === slug);
  if (!fallback) notFound();

  const { data: article } = await apiGet<Article>(`/content/education/${slug}`, fallback);

  return (
    <>
      <SiteHeader current="/voter-education" />
      <main id="main">
        <section className="page-hero on-dark">
          <div className="container">
            <nav className="breadcrumb" aria-label="Breadcrumb">
              <Link href="/">Home</Link>
              <span aria-hidden>/</span>
              <Link href="/voter-education">Voter education</Link>
            </nav>
            <h1>{article.title}</h1>
            <p className="lead">{article.summary}</p>
          </div>
        </section>
        <section className="section" style={{ paddingTop: '0.5rem' }}>
          <div className="container grid-2">
            <article className="card">
              {article.body.map((paragraph) => (
                <p key={paragraph.slice(0, 40)}>{paragraph}</p>
              ))}
              <p className="muted" style={{ fontSize: '0.85rem', marginBottom: 0 }}>
                Source: {article.sourceReference} · updated{' '}
                {new Date(article.updatedAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </article>
            <aside className="stack">
              <div className="card">
                <p className="eyebrow">More guides</p>
                <div className="stack">
                  {VOTER_EDUCATION.filter((a) => a.slug !== article.slug).map((a) => (
                    <Link key={a.slug} href={`/voter-education/${a.slug}`} className="link-card">
                      <h3 style={{ fontSize: '1rem', marginBottom: '0.1rem' }}>{a.title}</h3>
                      <p className="muted" style={{ fontSize: '0.86rem', margin: 0 }}>
                        {a.summary}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
              <div className="notice">
                <strong>Never share your voter card details.</strong>
                No one from this platform will ask for your VIN, card number, PIN or biometrics.
              </div>
            </aside>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
