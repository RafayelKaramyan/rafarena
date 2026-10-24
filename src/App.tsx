import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, Route, Routes, useLocation } from 'react-router-dom';
import { ArrowUpRight, Check, X } from 'lucide-react';
import { getMoment, type ViewState } from './domain/match';
import { Replay } from './domain/replay';
import { decodeView } from './domain/views';
import { useViews } from './storage/useViews';
import Explorer from './pages/Explorer';
import Moments from './pages/Moments';
import Saved from './pages/Saved';
import { SiteFooter, SiteHeader } from './ui/SiteChrome';
import Home from './pages/Home';
import { Article, Journal } from './pages/Journal';
import { GuidePage, Playbook } from './pages/Playbook';
import About from './pages/About';
import { guides, stories } from './content/editorial';

export default function App() {
  const location = useLocation();
  const isExplorer =
    location.pathname === '/explorer' ||
    (location.pathname === '/' && new URLSearchParams(location.search).has('moment'));
  const isWorld = !isExplorer && !['/moments', '/saved'].includes(location.pathname);
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
    if (!isExplorer) {
      replay.pause();
      return;
    }
    if (!location.search) return;
    const decoded = decodeView(location.search);
    setView(decoded.view);
    replay.configure(getMoment(decoded.view.momentId).durationMs, decoded.view.timeMs);
    if (decoded.warning) notify(decoded.warning);
  }, [isExplorer, location.pathname, location.search, replay, notify]);
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
    const title =
      stories.find((story) => location.pathname === `/journal/${story.slug}`)?.title ??
      guides.find((guide) => location.pathname === `/playbook/${guide.slug}`)?.title ??
      (
        {
          '/journal': 'The journal',
          '/playbook': 'The playbook',
          '/moments': 'The moments',
          '/saved': 'Saved views',
          '/about': 'Our perspective',
        } as Record<string, string>
      )[location.pathname] ??
      (isExplorer ? 'The replay room' : 'Game on. Eyes open.');
    document.title = `${title} — Rafarena`;
    document.getElementById('main')?.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [location.pathname, isExplorer]);
  const explorer = (
    <Explorer
      view={view}
      setView={setView}
      replay={replay}
      save={collection.save}
      notify={notify}
    />
  );
  return (
    <div className={`app ${isWorld ? 'app-world' : 'app-studio'}`}>
      <a
        className="skip-link"
        href="#main"
        onClick={(event) => {
          event.preventDefault();
          document.getElementById('main')?.focus();
        }}
      >
        Skip to content
      </a>
      <SiteHeader count={collection.views.length} />
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
          <Route path="/" element={isExplorer ? explorer : <Home notify={notify} />} />
          <Route path="/explorer" element={explorer} />
          <Route path="/journal" element={<Journal />} />
          <Route path="/journal/:slug" element={<Article />} />
          <Route path="/playbook" element={<Playbook />} />
          <Route path="/playbook/:slug" element={<GuidePage />} />
          <Route path="/about" element={<About />} />
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
                  Back to Rafarena
                  <ArrowUpRight size={17} />
                </Link>
              </section>
            }
          />
        </Routes>
      </main>
      <SiteFooter />
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
