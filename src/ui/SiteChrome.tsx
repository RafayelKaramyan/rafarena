import { useEffect, useState } from 'react';
import { ArrowRight, ArrowUpRight, Bookmark, Menu, Search } from 'lucide-react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import Mark from './Mark';
import Dialog from './Dialog';
import { guides, stories } from '../content/editorial';
import { defaultView, moments } from '../domain/match';
import { encodeView } from '../domain/views';

const navigation = [
  ['Discover', '/'],
  ['Stories', '/journal'],
  ['Playbook', '/playbook'],
  ['The moments', '/moments'],
  ['Match explorer', '/explorer'],
];

export function SiteHeader({ count }: { count: number }) {
  const [search, setSearch] = useState(false),
    [menu, setMenu] = useState(false),
    [query, setQuery] = useState('');
  const location = useLocation();
  useEffect(() => {
    setSearch(false);
    setMenu(false);
  }, [location.pathname, location.search]);
  const needle = query.trim().toLowerCase();
  const items = [
    ...stories.map((story) => ({
      name: story.title,
      type: story.category,
      to: `/journal/${story.slug}`,
      detail: story.intro,
    })),
    ...guides.map((guide) => ({
      name: guide.title,
      type: 'Playbook',
      to: `/playbook/${guide.slug}`,
      detail: guide.description,
    })),
    ...moments.map((moment) => ({
      name: moment.title,
      type: 'Replay',
      to: encodeView({ ...defaultView, momentId: moment.id, timeMs: 0 }),
      detail: moment.description,
    })),
  ].filter(
    (item) => !needle || `${item.name} ${item.type} ${item.detail}`.toLowerCase().includes(needle),
  );
  return (
    <>
      <div className="announcement">
        <span>FOR THE GAME. FOR THE CURIOUS.</span>
        <Link to="/about">
          A different perspective <ArrowUpRight size={12} />
        </Link>
      </div>
      <header className="site-header masthead">
        <Link className="brand" to="/" aria-label="Rafarena home">
          <Mark />
          <span>
            rafarena<span className="brand-period">·</span>
          </span>
        </Link>
        <nav className="masthead-nav" aria-label="Main navigation">
          {navigation.map(([label, to]) => (
            <NavLink key={to} to={to!} end={to === '/'}>
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="masthead-actions">
          <button
            aria-label="Search Rafarena"
            onClick={() => {
              setQuery('');
              setSearch(true);
            }}
          >
            <Search size={21} />
          </button>
          <Link
            to="/saved"
            aria-label={`Saved views ${count.toString().padStart(2, '0')}`}
            className="saved-nav"
          >
            <Bookmark size={20} />
            <span>{count.toString().padStart(2, '0')}</span>
          </Link>
          <button
            className="mobile-menu-button"
            aria-label="Open menu"
            onClick={() => setMenu(true)}
          >
            <Menu size={23} />
          </button>
        </div>
      </header>
      {menu && (
        <Dialog title="Explore Rafarena" onClose={() => setMenu(false)} wide>
          <nav className="mobile-navigation" aria-label="Mobile navigation">
            {navigation.map(([label, to], i) => (
              <Link to={to!} key={to} onClick={() => setMenu(false)}>
                <span>0{i + 1}</span>
                {label}
                <ArrowUpRight />
              </Link>
            ))}
            <Link to="/about" onClick={() => setMenu(false)}>
              <span>06</span>Our perspective
              <ArrowUpRight />
            </Link>
          </nav>
          <p className="menu-signoff">THE GAME LOOKS DIFFERENT FROM HERE.</p>
        </Dialog>
      )}
      {search && (
        <Dialog title="Find your next perspective." onClose={() => setSearch(false)} wide>
          <div className="global-search">
            <label>
              <Search size={23} />
              <input
                autoFocus
                aria-label="Search stories, playbooks and replays"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="A story. A move. A different angle."
              />
            </label>
            <p className="search-count" role="status">
              {needle
                ? `${items.length} RESULTS FOR “${query}”`
                : 'EXPLORE THE JOURNAL, PLAYBOOK & REPLAY ROOM'}
            </p>
            <div className="global-results">
              {items.slice(0, needle ? 13 : 5).map((item) => (
                <Link key={item.to} to={item.to} onClick={() => setSearch(false)}>
                  <span>{item.type}</span>
                  <strong>{item.name}</strong>
                  <ArrowUpRight size={20} />
                </Link>
              ))}
            </div>
            {!items.length && (
              <div className="search-empty">
                <h3>No perspective found. Yet.</h3>
                <p>Try “space”, “transition” or “culture”.</p>
                <button className="world-text-link" onClick={() => setQuery('')}>
                  Clear search <ArrowRight size={16} />
                </button>
              </div>
            )}
          </div>
        </Dialog>
      )}
    </>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer world-footer">
      <div className="footer-top">
        <div className="footer-statement">
          <Mark />
          <h2>
            For the game.
            <br />
            <span>For the curious.</span>
          </h2>
          <p>
            Stories to stay with you. Ideas to look at twice.
            <br />A whole game beyond the score.
          </p>
        </div>
        <div className="footer-links">
          <div>
            <h3>EXPLORE</h3>
            <Link to="/journal">The journal</Link>
            <Link to="/playbook">The playbook</Link>
            <Link to="/moments">All six moments</Link>
          </div>
          <div>
            <h3>TAKE ANOTHER LOOK</h3>
            <Link to="/explorer">Open the replay room</Link>
            <Link to="/saved">Your perspectives</Link>
            <Link to="/about">Our perspective</Link>
          </div>
          <div>
            <h3>ABOUT THE PROJECT</h3>
            <a href="https://github.com/RafayelKaramyan/rafarena" target="_blank" rel="noreferrer">
              Source & documentation <ArrowUpRight size={13} />
            </a>
            <a
              href="https://github.com/RafayelKaramyan/rafarena/blob/main/docs/photo-credits.md"
              target="_blank"
              rel="noreferrer"
            >
              Photography credits <ArrowUpRight size={13} />
            </a>
            <p>
              Independent editorial concept.
              <br />
              Fictional replay scenarios.
            </p>
          </div>
        </div>
      </div>
      <Link className="footer-wordmark" to="/" aria-label="Back to Rafarena home">
        rafarena<span>↗</span>
      </Link>
      <div className="footer-bottom">
        <span>© 2026 RAFARENA</span>
        <span>
          DESIGNED & BUILT BY{' '}
          <a href="https://github.com/RafayelKaramyan" target="_blank" rel="noreferrer">
            RAFAYEL KARAMYAN
          </a>
        </span>
        <span>AN INDEPENDENT PERSPECTIVE.</span>
      </div>
    </footer>
  );
}
