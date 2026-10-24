import { useState } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight, Search } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { defaultView } from '../domain/match';
import { encodeView } from '../domain/views';
import { media, readingMinutes, stories } from '../content/editorial';
import { StoryCard, WorldLink } from '../ui/World';

export function Journal() {
  const [category, setCategory] = useState('All stories'),
    [query, setQuery] = useState('');
  const filtered = stories.filter(
    (story) =>
      (category === 'All stories' || story.category === category) &&
      `${story.title} ${story.intro}`.toLowerCase().includes(query.toLowerCase().trim()),
  );
  return (
    <div className="journal-page">
      <section className="world-page-heading">
        <span className="world-kicker">THE RAFARENA JOURNAL / VOL. 01</span>
        <h1>
          THE OTHER SIDE
          <br />
          OF THE GAME<span>.</span>
        </h1>
        <div>
          <p>
            Ideas worth following. Places worth noticing.
            <br />
            Football stories for a different kind of reader.
          </p>
          <span>FOUR STORIES. MORE TO SEE.</span>
        </div>
      </section>
      <section className="world-section journal-collection">
        <div className="journal-filters">
          <div role="group" aria-label="Story category">
            {['All stories', 'Perspective', 'Tactics', 'Culture'].map((item) => (
              <button key={item} aria-pressed={category === item} onClick={() => setCategory(item)}>
                {item}
                <span>
                  {item === 'All stories'
                    ? '04'
                    : stories
                        .filter((s) => s.category === item)
                        .length.toString()
                        .padStart(2, '0')}
                </span>
              </button>
            ))}
          </div>
          <label className="journal-search">
            <Search size={19} />
            <input
              aria-label="Search journal"
              placeholder="Find a story"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
        </div>
        <p className="world-result-count" role="status">
          {filtered.length.toString().padStart(2, '0')} STORIES IN VIEW
        </p>
        <div className="journal-grid">
          {filtered.map((story) => (
            <StoryCard key={story.slug} story={story} large />
          ))}
        </div>
        {!filtered.length && (
          <div className="world-empty">
            <h2>Keep looking.</h2>
            <p>No stories match this combination.</p>
            <button
              className="world-button"
              onClick={() => {
                setCategory('All stories');
                setQuery('');
              }}
            >
              Show all stories <ArrowRight size={19} />
            </button>
          </div>
        )}
      </section>
      <section className="journal-bottom-note">
        <span>READ. REPLAY. REPEAT.</span>
        <p>A different story can start with the same ten seconds.</p>
        <WorldLink to="/explorer">Take it to the pitch</WorldLink>
      </section>
    </div>
  );
}

export function Article() {
  const { slug } = useParams(),
    story = stories.find((item) => item.slug === slug);
  if (!story)
    return (
      <div className="world-empty">
        <h1>This story is still unwritten.</h1>
        <WorldLink to="/journal">Back to the journal</WorldLink>
      </div>
    );
  const next = stories[(stories.indexOf(story) + 1) % stories.length]!;
  return (
    <article className="article-page">
      <header className="article-heading">
        <Link to="/journal" className="world-text-link">
          <ArrowLeft size={17} />
          Back to the journal
        </Link>
        <div className="article-overline">
          <span>
            FIELDNOTE {story.issue} / {story.category.toUpperCase()}
          </span>
          <span>{readingMinutes(story)} MIN READ</span>
        </div>
        <h1>{story.title}</h1>
        <p>{story.intro}</p>
        <span className="article-byline">RAFARENA EDITORIAL / AN INDEPENDENT PERSPECTIVE</span>
      </header>
      <figure
        className={`article-cover ${story.image === 'street-football' ? 'street-cover' : ''}`}
      >
        <img
          src={media(story.image)}
          alt={story.alt}
          width="1800"
          height="1200"
          fetchPriority="high"
        />
        <figcaption>{story.caption}</figcaption>
      </figure>
      <div className="article-layout">
        <aside className="article-toc">
          <span className="world-kicker">IN THIS STORY</span>
          <ol>
            {story.sections.map((section, index) => (
              <li key={section.title}>
                <a
                  href={`#section-${index}`}
                  onClick={(event) => {
                    event.preventDefault();
                    document
                      .getElementById(`section-${index}`)
                      ?.scrollIntoView({ behavior: 'instant' });
                    document.getElementById(`section-${index}`)?.focus({ preventScroll: true });
                  }}
                >
                  {section.title}
                </a>
              </li>
            ))}
          </ol>
          <Link
            className="world-text-link"
            to={encodeView({ ...defaultView, momentId: story.momentId, timeMs: 0 })}
          >
            See the sequence <ArrowUpRight size={17} />
          </Link>
        </aside>
        <div className="article-body">
          {story.sections.map((section, index) => (
            <section id={`section-${index}`} tabIndex={-1} key={section.title}>
              <span className="article-section-number">0{index + 1}</span>
              <h2>{section.title}</h2>
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
              {index === 1 && (
                <blockquote>
                  {story.pullquote}
                  <span>— A RAFARENA PERSPECTIVE</span>
                </blockquote>
              )}
            </section>
          ))}
          <div className="article-replay-callout">
            <span className="world-kicker">DON'T JUST READ IT. LOOK AGAIN.</span>
            <h2>
              Your next angle
              <br />
              is waiting.
            </h2>
            <WorldLink to={encodeView({ ...defaultView, momentId: story.momentId, timeMs: 0 })}>
              Explore this moment
            </WorldLink>
          </div>
          <p className="article-scope-note">
            The replay examples are fictional and authored for this experience. Editorial
            photographs depict independent people and places; no club affiliation is implied.
            Photography credits are linked in the footer.
          </p>
        </div>
      </div>
      <Link className="next-story" to={`/journal/${next.slug}`}>
        <span>NEXT FIELDNOTE / {next.category.toUpperCase()}</span>
        <h2>{next.title}</h2>
        <ArrowUpRight size={58} />
      </Link>
    </article>
  );
}
