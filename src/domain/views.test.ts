import { describe, expect, it } from 'vitest';
import { defaultView } from './match';
import { decodeView, encodeView, savedViewSchema, viewSchema } from './views';
import { createId } from './id';

describe('portable perspectives', () => {
  it('round-trips exact replay, focus and layer state', () => {
    const view = {
      ...defaultView,
      timeMs: 4780,
      camera: 'tactical' as const,
      playerId: 'h10',
      layers: { passing: false, trails: true, zones: true },
    };
    const decoded = decodeView(encodeView(view).split('?')[1]!);
    expect(decoded.warning).toBeNull();
    expect(decoded.view).toMatchObject(view);
  });
  it('keeps all three overlay layers off when a link explicitly requests that', () => {
    const view = { ...defaultView, layers: { passing: false, trails: false, zones: false } };
    expect(decodeView(encodeView(view).split('?')[1]!).view.layers).toEqual(view.layers);
  });
  it('round-trips the actual free-orbit camera position and target', () => {
    const view = {
      ...defaultView,
      camera: 'orbit' as const,
      orbit: {
        position: [92.5, 70.23, 113.1] as [number, number, number],
        target: [4, 0, -2] as [number, number, number],
      },
    };
    expect(decodeView(encodeView(view).split('?')[1]!).view.orbit).toEqual(view.orbit);
  });
  it.each([
    '?moment=unknown',
    '?moment=between-the-lines&t=Infinity',
    '?moment=turn-and-go&t=9000',
    '?moment=between-the-lines&camera=made-up',
    '?moment=between-the-lines&player=unknown',
    '?moment=between-the-lines&orbit=%7Bbad',
  ])('recovers safely from %s', (search) => {
    const result = decodeView(search);
    expect(result.warning).toBeTruthy();
    expect(result.view).toEqual(defaultView);
  });
  it('excludes private observations and names from shared URLs', () => {
    const saved = {
      id: createId(),
      title: 'A private observation',
      note: 'Do not put this in a URL',
      createdAt: new Date().toISOString(),
      view: defaultView,
    };
    const link = encodeView(saved.view);
    expect(link).not.toContain(saved.title);
    expect(link).not.toContain('private');
    expect(link).not.toContain('observation');
    expect(savedViewSchema.safeParse(saved).success).toBe(true);
  });
  it('validates view names, camera bounds and player identity before saving', () => {
    expect(
      savedViewSchema.safeParse({
        id: createId(),
        title: ' ',
        note: '',
        createdAt: new Date().toISOString(),
        view: defaultView,
      }).success,
    ).toBe(false);
    expect(
      viewSchema.safeParse({ ...defaultView, orbit: { position: [0, 8000, 1], target: [0, 0, 0] } })
        .success,
    ).toBe(false);
  });
});
