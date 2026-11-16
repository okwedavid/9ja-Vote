import Link from 'next/link';
import { VOTER_EDUCATION } from '@9ja-vote/shared-types';
import { SiteFooter, SiteHeader } from '../../components/SiteChrome';
import { apiGet } from '../../lib/api';

export const dynamic = 'force-dynamic';

type Article = (typeof VOTER_EDUCATION)[number];

const CATEGORY_LABEL: Record<Article['category'], string> = {
  REGISTRATION: 'Registration',
  VOTING_DAY: 'Voting day',
  RESULTS: 'Results',
  SAFETY: 'Safety',
  ACCESSIBILITY: 'Accessibility',
};

export default async function EducationPage() {
  const { data } = await apiGet<{ notice: string; items: Article[] }>('/content/education', {
    notice: 'Civic information only',
    items: VOTER_EDUCATION,
  });

  return (
    <>
      <SiteHeader current="/voter-education" />
      <main id="main">
        <section className="page-hero on-dark">
          <div className="container">
            <p className="eyebrow">Voter education</p>
            <h1>Know before you go</h1>
            <p className="lead">
              Short, plain-language guides on registration, election day, collation and staying safe. INEC runs the
              official process — this library only helps you understand it.
            </p>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div className="grid-2">
              {data.items.map((article) => (
                <Link key={article.slug} className="link-card card" href={`/voter-education/${article.slug}`}>
                  <span className="badge">{CATEGORY_LABEL[article.category]}</span>
                  <h3 style={{ marginTop: '0.7rem' }}>{article.title}</h3>
                  <p className="muted">{article.summary}</p>
                  <span className="more">Read the guide →</span>
                </Link>
              ))}
            </div>
            <div className="notice" style={{ marginTop: '1.4rem' }}>
              <strong>This is not official guidance.</strong>
              Requirements and procedures change. Always confirm details with INEC before election day.
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
