import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { media, readingMinutes, type Story } from '../content/editorial';
import type { ReactNode } from 'react';

export function WorldLink({
  to,
  children,
  light = false,
  className = '',
}: {
  to: string;
  children: ReactNode;
  light?: boolean;
  className?: string;
}) {
  return (
    <Link className={`world-button ${light ? 'light' : ''} ${className}`} to={to}>
      <span>{children}</span>
      <ArrowUpRight size={20} />
    </Link>
  );
}
export function SectionTitle({
  eyebrow,
  children,
  link,
  to = '/journal',
}: {
  eyebrow: string;
  children: ReactNode;
  link?: string;
  to?: string;
}) {
  return (
    <div className="world-section-title">
      <div>
        <span className="world-kicker">{eyebrow}</span>
        <h2>{children}</h2>
      </div>
      {link && (
        <Link className="world-text-link" to={to}>
          {link}
          <ArrowRight size={19} />
        </Link>
      )}
    </div>
  );
}
export function StoryCard({
  story,
  large = false,
  headingLevel = 3,
}: {
  story: Story;
  large?: boolean;
  headingLevel?: 2 | 3;
}) {
  const Heading = headingLevel === 2 ? 'h2' : 'h3';
  return (
    <Link to={`/journal/${story.slug}`} className={`story-card ${large ? 'large' : ''}`}>
      <div className="story-image">
        <img src={media(story.image)} alt={story.alt} loading="lazy" width="1200" height="800" />
        <span className="story-index">FIELDNOTE {story.issue}</span>
        <span className="story-arrow">
          <ArrowUpRight size={24} />
        </span>
      </div>
      <div className="story-meta">
        <span>{story.category}</span>
        <span>{readingMinutes(story)} MIN READ</span>
      </div>
      <Heading>{story.title}</Heading>
      <p>{story.intro}</p>
      <span className="story-read">
        Read the story <ArrowUpRight size={16} />
      </span>
    </Link>
  );
}
