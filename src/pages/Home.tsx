import { ArrowDown, ArrowRight, ArrowUpRight, MoveUpRight, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { faqs, guides, media, stories } from '../content/editorial';
import { SectionTitle, StoryCard, WorldLink } from '../ui/World';
import StadiumTeaser from '../ui/StadiumTeaser';

export default function Home({ notify }: { notify: (message: string) => void }) {
  return (
    <div className="world-home">
      <section className="campaign-hero">
        <img
          className="campaign-photo"
          src={media('hero-football')}
          alt="Football players contesting the ball on a sunlit grass pitch"
          width="1800"
          height="1201"
          fetchPriority="high"
        />
        <div className="campaign-shade" />
        <div className="campaign-topline">
          <span>FOOTBALL. SEEN DIFFERENTLY.</span>
          <span>THE RAFARENA JOURNAL / VOL. 01</span>
        </div>
        <div className="campaign-copy">
          <span className="campaign-tag">FOR THE LOVE OF THE GAME</span>
          <h1>
            <span>GAME ON.</span>
            <span>EYES OPEN.</span>
          </h1>
          <div className="campaign-bottom">
            <p>
              There is a whole game beyond the score.
              <br />
              Stories, ideas and a different way to see it.
            </p>
            <WorldLink to="/journal/the-game-between-the-moments" light>
              Discover the story
            </WorldLink>
          </div>
        </div>
        <Link className="hero-side-link" to="/explorer">
          <span>
            STEP INSIDE
            <br />
            THE REPLAY ROOM
          </span>
          <ArrowUpRight size={32} />
        </Link>
        <div className="campaign-footer">
          <span>INDEPENDENT FOOTBALL CULTURE & PERSPECTIVE</span>
          <a
            href="#discover"
            onClick={(event) => {
              event.preventDefault();
              document.getElementById('discover')?.scrollIntoView({
                behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
                  ? 'instant'
                  : 'smooth',
              });
            }}
          >
            KEEP EXPLORING <ArrowDown size={16} />
          </a>
        </div>
      </section>
      <div className="world-strip" aria-hidden="true">
        <span>READ THE GAME</span>
        <MoveUpRight />
        <span>FIND THE SPACE</span>
        <MoveUpRight />
        <span>CHANGE YOUR ANGLE</span>
        <MoveUpRight />
        <span>MAKE IT YOURS</span>
        <MoveUpRight />
      </div>
      <section className="world-section discover-section" id="discover">
        <SectionTitle eyebrow="THE GAME IS ONLY THE BEGINNING" link="Explore all stories">
          A different kind
          <br />
          of matchday.
        </SectionTitle>
        <div className="discover-grid">
          <Link className="discover-feature" to="/journal/the-pitch-is-a-meeting-place">
            <img
              src={media('street-football')}
              alt="A footballer dribbling along a city street, photographed in black and white"
              loading="lazy"
              width="1200"
              height="1805"
            />
            <div>
              <span className="world-kicker">01 / FOOTBALL CULTURE</span>
              <h3>
                No stadium.
                <br />
                Still everything.
              </h3>
              <span className="feature-link">
                THE GAME BELONGS EVERYWHERE <ArrowUpRight size={22} />
              </span>
            </div>
            <span className="feature-circle">
              <ArrowUpRight size={30} />
            </span>
          </Link>
          <div className="discover-secondary">
            <Link className="discover-small" to="/journal/space-has-a-far-side">
              <img
                src={media('field-aerial')}
                alt="A football field and its red stands viewed from above"
                loading="lazy"
                width="1200"
                height="675"
              />
              <div>
                <span className="world-kicker">02 / A CLOSER LOOK</span>
                <h3>
                  Change
                  <br />
                  the picture.
                </h3>
                <ArrowUpRight size={29} />
              </div>
            </Link>
            <Link className="discover-small detail" to="/playbook/find-the-pocket">
              <img
                src={media('ball-detail')}
                alt="Football boots and a ball on a grass pitch"
                loading="lazy"
                width="1200"
                height="1600"
              />
              <div>
                <span className="world-kicker">03 / THE PLAYBOOK</span>
                <h3>
                  Small details.
                  <br />
                  Big ideas.
                </h3>
                <ArrowUpRight size={29} />
              </div>
            </Link>
          </div>
        </div>
        <div className="discover-caption">
          <span>FROM THE TOUCHLINE TO THE BIGGER PICTURE.</span>
          <p>For the ones who rewind a pass. Notice a run. Stay for the story.</p>
        </div>
      </section>
      <section className="home-lab">
        <div className="lab-copy">
          <span className="world-kicker">
            <i />
            THE INTERACTIVE REPLAY ROOM
          </span>
          <h2>
            THE GAME.
            <br />
            FROM EVERY
            <br />
            <span>ANGLE.</span>
          </h2>
          <p>
            One move. A thousand ways to see it. Step inside the pitch, find your angle and follow
            the idea that changes the picture.
          </p>
          <WorldLink to="/explorer" light>
            Enter the replay room
          </WorldLink>
          <div className="lab-footnote">
            <span>01 — CHOOSE A MOMENT</span>
            <span>02 — CHANGE YOUR PERSPECTIVE</span>
            <span>03 — KEEP THE IDEA</span>
          </div>
        </div>
        <StadiumTeaser notify={notify} />
      </section>
      <section className="world-section home-playbook">
        <SectionTitle
          eyebrow="THE PLAYBOOK / THREE WAYS IN"
          link="Open the playbook"
          to="/playbook"
        >
          Good things happen
          <br />
          when you look again.
        </SectionTitle>
        <div className="playbook-preview-grid">
          {guides.map((guide, index) => (
            <Link key={guide.slug} to={`/playbook/${guide.slug}`} className="playbook-preview">
              <div className="guide-number">
                0{index + 1}
                <ArrowUpRight size={28} />
              </div>
              <h3>{guide.title}</h3>
              <p>{guide.description}</p>
              <span className="world-kicker">3 CHECKPOINTS / ONE NEW PERSPECTIVE</span>
            </Link>
          ))}
        </div>
      </section>
      <section className="culture-banner">
        <img
          src={media('stadium-night')}
          alt="A football stadium and crowd under evening lights"
          loading="lazy"
          width="1200"
          height="800"
        />
        <div className="culture-overlay" />
        <div>
          <span className="world-kicker">IT DOESN'T END AT THE FINAL WHISTLE.</span>
          <h2>
            MORE THAN
            <br />
            NINETY MINUTES.
          </h2>
          <WorldLink to="/journal/the-pitch-is-a-meeting-place" light>
            Feel the bigger picture
          </WorldLink>
        </div>
        <span className="culture-coordinate">THE PLACES. THE PEOPLE. THE GAME.</span>
      </section>
      <section className="world-section journal-section">
        <SectionTitle eyebrow="FIELDNOTES / VOL. 01" link="Read the journal">
          Worth a closer look.
        </SectionTitle>
        <div className="home-story-grid">
          {[stories[0]!, stories[1]!, stories[3]!].map((story) => (
            <StoryCard key={story.slug} story={story} />
          ))}
        </div>
      </section>
      <section className="belief-section">
        <span className="world-kicker">OUR PERSPECTIVE</span>
        <h2>
          FOOTBALL IS
          <br />
          FOR EVERY
          <br />
          <span>PERSPECTIVE.</span>
        </h2>
        <div className="belief-bottom">
          <ArrowUpRight className="belief-arrow" size={110} />
          <p>
            Every finish starts with a movement.
            <br />
            Every result holds a bigger story.
            <br />A place for the endlessly curious.
          </p>
          <Link className="world-text-link" to="/about">
            Get to know Rafarena <ArrowRight size={23} />
          </Link>
        </div>
      </section>
      <section className="world-section world-faq">
        <div>
          <span className="world-kicker">A FEW THINGS TO KNOW</span>
          <h2>
            Curious?
            <br />
            Good.
          </h2>
          <p>
            There is always another angle.
            <br />
            Start with these.
          </p>
        </div>
        <div className="faq-list">
          {faqs.map((faq) => (
            <details key={faq.question}>
              <summary>
                {faq.question}
                <Plus size={20} />
              </summary>
              <p>{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
