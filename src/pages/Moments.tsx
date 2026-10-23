import { useState } from 'react';
import { ArrowUpRight, Search, SlidersHorizontal } from 'lucide-react';
import { Link } from 'react-router-dom';
import { defaultView, moments, progression, type Moment } from '../domain/match';
import { encodeView } from '../domain/views';
import FlatPitch from '../ui/FlatPitch';

export default function Moments() {
  const [query, setQuery] = useState(''),
    [category, setCategory] = useState('All moments');
  const filtered = moments.filter(
    (moment) =>
      (category === 'All moments' || category === moment.category) &&
      `${moment.title} ${moment.description} ${moment.category}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  return (
    <section className="library-page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">THE MATCH, FRAME BY FRAME</span>
          <h1>
            Small moments.
            <br />
            <em>Beautiful possibilities.</em>
          </h1>
        </div>
        <p>
          Six ways to read the same game.
          <br />
          Choose a sequence. Find your perspective.
        </p>
      </div>
      <div className="library-filter">
        <div className="filter-tabs" role="group" aria-label="Moment category">
          {['All moments', 'Build-up', 'Transition', 'Set piece'].map((value) => (
            <button
              key={value}
              className={category === value ? 'active' : ''}
              aria-pressed={category === value}
              onClick={() => setCategory(value)}
            >
              {value}
              {value === 'All moments' && <span>06</span>}
            </button>
          ))}
        </div>
        <label className="search-field">
          <Search size={17} />
          <input
            aria-label="Search moments"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Find your moment…"
          />
          {query && (
            <button aria-label="Clear search" onClick={() => setQuery('')}>
              ×
            </button>
          )}
        </label>
      </div>
      <div className="library-count" role="status">
        <span>{filtered.length.toString().padStart(2, '0')} MOMENTS IN VIEW</span>
        <span>
          <SlidersHorizontal size={13} /> CURATED / SOLACE FC VS UNION 04
        </span>
      </div>
      <div className="library-grid">
        {filtered.map((moment) => (
          <MomentCard key={moment.id} moment={moment} />
        ))}
      </div>
      {!filtered.length && (
        <div className="empty-state">
          <Search size={30} />
          <h2>A little too much space.</h2>
          <p>No moments match those filters.</p>
          <button
            className="button secondary"
            onClick={() => {
              setQuery('');
              setCategory('All moments');
            }}
          >
            Show all six moments
            <ArrowUpRight size={16} />
          </button>
        </div>
      )}
      <div className="library-footnote">
        <span>AN INDEPENDENT STUDY OF THE BEAUTIFUL GAME</span>
        <p>Every fixture, player and movement here is authored for this experience.</p>
      </div>
    </section>
  );
}
function MomentCard({ moment }: { moment: Moment }) {
  const index = moments.indexOf(moment);
  const view = { ...defaultView, momentId: moment.id, timeMs: moment.durationMs * 0.4 };
  return (
    <Link className="library-card" to={encodeView(view)}>
      <div className="library-card-image">
        <FlatPitch
          view={{ ...view, layers: { passing: true, trails: true, zones: false } }}
          compact
        />
        <span className="library-card-index">0{index + 1}</span>
        <span className="category-pill">{moment.category}</span>
        <span className="library-card-play">
          <ArrowUpRight size={23} />
        </span>
      </div>
      <div className="library-card-body">
        <div className="library-card-meta">
          <span>{moment.clock} / SECOND HALF</span>
          <span>{moment.durationMs / 1000} SEC REPLAY</span>
        </div>
        <h2>{moment.title}</h2>
        <p>{moment.subtitle}</p>
        <div className="library-card-bottom">
          <span>{progression(moment)}m progression</span>
          <strong>
            Explore the sequence <ArrowUpRight size={15} />
          </strong>
        </div>
      </div>
    </Link>
  );
}
