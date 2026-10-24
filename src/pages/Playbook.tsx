import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight, Check } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { guideView, guides, media } from '../content/editorial';
import { encodeView } from '../domain/views';
import FlatPitch from '../ui/FlatPitch';
import { WorldLink } from '../ui/World';

export function Playbook() {
  return (
    <div className="playbook-page">
      <section className="world-page-heading">
        <span className="world-kicker">THE PLAYBOOK / A DIFFERENT WAY IN</span>
        <h1>
          MIND ON.
          <br />
          GAME OPEN<span>.</span>
        </h1>
        <div>
          <p>
            Small studies of space, movement and possibility.
            <br />
            Choose an idea. Follow three checkpoints. Find your own angle.
          </p>
          <span>THREE GUIDES / SIX AUTHORED SEQUENCES</span>
        </div>
      </section>
      <section className="world-section playbook-list">
        {guides.map((guide, index) => (
          <Link className="guide-card" key={guide.slug} to={`/playbook/${guide.slug}`}>
            <div className="guide-photo">
              <img
                src={media(guide.image)}
                alt={guide.alt}
                loading="lazy"
                width="1200"
                height="800"
              />
              <span>0{index + 1}</span>
            </div>
            <div className="guide-card-body">
              <span className="world-kicker">{guide.kicker}</span>
              <h2>{guide.title}</h2>
              <p>{guide.description}</p>
              <ul>
                {guide.chapters.map((chapter) => (
                  <li key={chapter.title}>
                    <Check size={14} />
                    {chapter.title}
                  </li>
                ))}
              </ul>
              <span className="world-text-link">
                Start the study <ArrowUpRight size={24} />
              </span>
            </div>
          </Link>
        ))}
      </section>
      <section className="playbook-method">
        <span className="world-kicker">HOW TO USE THE PLAYBOOK</span>
        <h2>
          Look once.
          <br />
          Notice something.
          <br />
          Look again.
        </h2>
        <p>
          Each guide opens a few still frames from a fictional sequence. They are starting points
          for your attention. The replay room lets you slow the movement down, choose another camera
          and keep the observation that matters to you.
        </p>
        <WorldLink to="/moments">Explore all six moments</WorldLink>
      </section>
    </div>
  );
}

export function GuidePage() {
  const { slug } = useParams(),
    guide = guides.find((item) => item.slug === slug);
  const [chapter, setChapter] = useState(0);
  useEffect(() => setChapter(0), [slug]);
  if (!guide)
    return (
      <div className="world-empty">
        <h1>Let's find another route.</h1>
        <WorldLink to="/playbook">Back to the playbook</WorldLink>
      </div>
    );
  const current = guide.chapters[chapter]!,
    view = guideView(guide, chapter);
  return (
    <div className="guide-page">
      <div className="guide-breadcrumb">
        <Link className="world-text-link" to="/playbook">
          <ArrowLeft size={17} />
          Back to the playbook
        </Link>
        <span>{guide.kicker}</span>
      </div>
      <div className="guide-intro">
        <h1>{guide.title}</h1>
        <p>{guide.description}</p>
      </div>
      <section className="guided-study">
        <div className="guide-steps" role="group" aria-label="Study checkpoints">
          {guide.chapters.map((item, index) => (
            <button
              key={item.title}
              aria-pressed={chapter === index}
              onClick={() => setChapter(index)}
            >
              <span>0{index + 1}</span>
              <strong>{item.title}</strong>
              <span className="checkpoint-time">{(item.timeMs / 1000).toFixed(1)}S</span>
              <ArrowRight size={20} />
            </button>
          ))}
        </div>
        <div className="study-diagram">
          <div className="study-meta">
            <span>AUTHORED SCENE / TOP-DOWN</span>
            <span>CHECKPOINT 0{chapter + 1}</span>
          </div>
          <FlatPitch view={view} />
          <div className="study-key">
            <span>
              <i />
              SOLACE FC
            </span>
            <span>
              <i />
              UNION 04
            </span>
            <span>HIGHLIGHTED: #{guide.playerId.slice(1)}</span>
          </div>
        </div>
        <div className="study-observation">
          <span className="world-kicker">
            CHECKPOINT 0{chapter + 1} / {(current.timeMs / 1000).toFixed(1)} SECONDS
          </span>
          <h2>{current.title}</h2>
          <p>{current.body}</p>
          <div className="study-watch">
            <ArrowUpRight size={27} />
            <span>
              WATCH FOR THIS<strong>{current.watch}</strong>
            </span>
          </div>
          <WorldLink to={encodeView(view)}>Open this frame in 3D</WorldLink>
          {chapter < 2 && (
            <button className="world-text-link" onClick={() => setChapter(chapter + 1)}>
              Next checkpoint <ArrowRight size={19} />
            </button>
          )}
        </div>
      </section>
      <section className="guide-after">
        <span className="world-kicker">YOUR TURN TO LOOK CLOSER</span>
        <h2>
          The next observation
          <br />
          is yours.
        </h2>
        <p>
          Open this exact frame in the replay room. Change the camera, turn the guides off and see
          what you notice. A saved view keeps your own title and observation alongside the
          perspective.
        </p>
        <Link to="/moments" className="world-text-link">
          Choose another moment <ArrowUpRight size={20} />
        </Link>
      </section>
    </div>
  );
}
