import { describe, expect, it } from 'vitest';
import { existsSync } from 'node:fs';
import { guides, guideView, media, stories } from './editorial';
import { decodeView, encodeView, viewSchema } from '../domain/views';
import { moments } from '../domain/match';

describe('editorial destinations', () => {
  it.each(guides)('opens valid shareable checkpoints for $title', (guide) => {
    for (let checkpoint = 0; checkpoint < guide.chapters.length; checkpoint++) {
      const view = guideView(guide, checkpoint);
      expect(viewSchema.safeParse(view).success).toBe(true);
      const link = encodeView(view);
      expect(link).toMatch(/^\/explorer\?/);
      expect(decodeView(link.split('?')[1]!).view).toEqual(view);
    }
  });
  it('keeps each story connected to a real authored scene and a bundled photograph', () => {
    expect(new Set(stories.map((story) => story.slug)).size).toBe(stories.length);
    for (const story of stories) {
      expect(moments.some((moment) => moment.id === story.momentId)).toBe(true);
      expect(existsSync(`public/media/${story.image}.webp`)).toBe(true);
      expect(media(story.image)).toContain(`/media/${story.image}.webp`);
      expect(story.sections.length).toBeGreaterThanOrEqual(3);
    }
  });
});
