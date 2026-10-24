import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { media } from '../content/editorial';
import { WorldLink } from '../ui/World';

export default function About() {
  return (
    <div className="about-page">
      <section className="about-hero">
        <span className="world-kicker">OUR PERSPECTIVE / EST. 2026</span>
        <h1>
          FOR THE GAME.
          <br />
          FOR THE
          <br />
          <span>CURIOUS.</span>
        </h1>
        <p>
          Some people watch the result.
          <br />
          We like to look at everything around it.
        </p>
        <ArrowUpRight size={115} />
      </section>
      <section className="about-photo">
        <img
          src={media('stadium-night')}
          alt="The light and atmosphere around a football stadium"
          width="1200"
          height="800"
        />
        <span>THE GAME IS ONLY THE BEGINNING.</span>
      </section>
      <section className="world-section about-introduction">
        <span className="world-kicker">THIS IS RAFARENA.</span>
        <div>
          <h2>
            A place to stay
            <br />
            with the game.
          </h2>
          <p>
            For the run you almost missed. The pass you wanted to rewind. The pitch that reminds you
            why you started watching in the first place.
          </p>
          <p>
            Rafarena brings an independent journal, a visual playbook and an interactive replay room
            into one place. Read an idea, follow it onto the pitch and keep the perspective that
            makes it yours.
          </p>
        </div>
      </section>
      <section className="about-principles">
        {[
          [
            '01',
            'Stay curious.',
            'A question is a good place to begin. The journal offers a perspective, not the only answer.',
          ],
          [
            '02',
            'Look a little closer.',
            'Our fictional sequences give you the time and the angles to follow one small idea all the way through.',
          ],
          [
            '03',
            'Make it your own.',
            'Save the exact view with a private observation. Share the scene, keep the note, and come back with fresh eyes.',
          ],
        ].map(([index, title, body]) => (
          <div key={index}>
            <span>{index}</span>
            <h2>{title}</h2>
            <p>{body}</p>
          </div>
        ))}
      </section>
      <section className="world-section about-project">
        <div>
          <span className="world-kicker">THE INDEPENDENT PROJECT</span>
          <h2>
            Built with
            <br />a point of view.
          </h2>
        </div>
        <div>
          <p>
            Created by Rafayel Karamyan as an original frontend and visual-design portfolio project.
            Rafarena is independent of sports clubs, apparel brands and employers.
          </p>
          <p>
            The photographs are real editorial images used with photographer credits. The replay
            teams, players and movements are fictional and authored for this experience. Saved
            perspectives live in your browser; there is no account or cloud backup.
          </p>
          <div>
            <a
              className="world-text-link"
              href="https://github.com/RafayelKaramyan/rafarena"
              target="_blank"
              rel="noreferrer"
            >
              Explore the project <ArrowUpRight size={18} />
            </a>
            <Link className="world-text-link" to="/journal">
              Read our first issue <ArrowUpRight size={18} />
            </Link>
          </div>
        </div>
      </section>
      <section className="about-next">
        <h2>
          THERE IS ALWAYS
          <br />
          ANOTHER ANGLE.
        </h2>
        <WorldLink to="/explorer">Find yours</WorldLink>
      </section>
    </div>
  );
}
