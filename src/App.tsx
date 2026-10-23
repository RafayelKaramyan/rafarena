import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, NavLink, Route, Routes, useLocation } from 'react-router-dom';
import { ArrowUpRight, Check, X } from 'lucide-react';
import { getMoment, type ViewState } from './domain/match';
import { Replay } from './domain/replay';
import { decodeView } from './domain/views';
import { useViews } from './storage/useViews';
import Explorer from './pages/Explorer';
import Moments from './pages/Moments';
import Saved from './pages/Saved';
import Mark from './ui/Mark';

export default function App() {
  const location = useLocation();
  const [view, setView] = useState<ViewState>(() => decodeView(location.search).view);
  const [replay] = useState(() => new Replay());
  const collection = useViews();
  const [notice, setNotice] = useState('');
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const notify = useCallback((message: string) => {
    clearTimeout(timer.current);
    setNotice(message);
    timer.current = setTimeout(() => setNotice(''), 6500);
  }, []);
  useEffect(() => {
    if (location.pathname !== '/') {
      replay.pause();
      return;
    }
    if (!location.search) return;
    const decoded = decodeView(location.search);
    setView(decoded.view);
    replay.configure(getMoment(decoded.view.momentId).durationMs, decoded.view.timeMs);
    if (decoded.warning) notify(decoded.warning);
  }, [location.pathname, location.search, replay, notify]);
  useEffect(() => {
    const hidden = () => {
      if (document.hidden) replay.pause();
    };
    document.addEventListener('visibilitychange', hidden);
    return () => {
      document.removeEventListener('visibilitychange', hidden);
      clearTimeout(timer.current);
      replay.destroy();
    };
  }, [replay]);
  useEffect(() => {
    document.title = `${location.pathname === '/moments' ? 'The moments' : location.pathname === '/saved' ? 'Saved views' : 'A different perspective'} — Rafarena`;
    document.getElementById('main')?.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [location.pathname]);
  return (
    <div className="app">
      <a
        className="skip-link"
        href="#main"
        onClick={(event) => {
          event.preventDefault();
          document.getElementById('main')?.focus();
        }}
      >
        Skip to the replay room
      </a>
      <header className="site-header">
        <Link className="brand" to="/" aria-label="Rafarena home">
          <Mark />
          <span>
            rafarena<span className="brand-period">·</span>
          </span>
        </Link>
        <nav aria-label="Main navigation">
          <NavLink to="/" end>
            Match explorer
          </NavLink>
          <NavLink to="/moments">The moments</NavLink>
          <NavLink to="/saved">
            Saved views
            <span className="nav-count">{collection.views.length.toString().padStart(2, '0')}</span>
          </NavLink>
        </nav>
        <span className="header-signoff">
          A DIFFERENT
          <br />
          PERSPECTIVE.
          <ArrowUpRight size={19} />
        </span>
      </header>
      <main id="main" tabIndex={-1} className="main-container">
        {collection.error && (
          <div className="storage-alert" role="alert">
            <div>
              <strong>Your saved views need attention.</strong>
              <p>{collection.error}</p>
            </div>
            <button
              className="text-button"
              onClick={() => {
                void collection.refresh();
              }}
            >
              Try again
              <ArrowUpRight size={14} />
            </button>
          </div>
        )}
        <Routes>
          <Route
            path="/"
            element={
              <Explorer
                view={view}
                setView={setView}
                replay={replay}
                save={collection.save}
                notify={notify}
              />
            }
          />
          <Route path="/moments" element={<Moments />} />
          <Route path="/saved" element={<Saved {...collection} notify={notify} />} />
          <Route
            path="*"
            element={
              <section className="empty-state">
                <span className="eyebrow">OUTSIDE THE LINES</span>
                <h1>This view has moved.</h1>
                <p>The pitch is always a good place to start.</p>
                <Link to="/" className="button primary">
                  Back to the match
                  <ArrowUpRight size={17} />
                </Link>
              </section>
            }
          />
        </Routes>
      </main>
      <footer className="site-footer">
        <Link className="footer-brand" to="/">
          <Mark />
          <span>THE GAME LOOKS DIFFERENT FROM HERE.</span>
        </Link>
        <p>
          Independent portfolio study by{' '}
          <a href="https://github.com/RafayelKaramyan" target="_blank" rel="noreferrer">
            Rafayel Karamyan
            <ArrowUpRight size={12} />
          </a>
          <span>Fictional teams. Authored movements. An original perspective.</span>
        </p>
        <span className="footer-year">© 2026 / RAFARENA</span>
      </footer>
      {notice && (
        <div className="toast" role="status">
          <Check size={17} />
          <span>{notice}</span>
          <button
            className="icon-button"
            aria-label="Dismiss notification"
            onClick={() => setNotice('')}
          >
            <X size={15} />
          </button>
        </div>
      )}
    </div>
  );
}
