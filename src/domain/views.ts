import { z } from 'zod';
import { defaultView, getMoment, moments, players, type ViewState } from './match';

export const viewSchema = z
  .object({
    momentId: z.string().refine((id) => moments.some((m) => m.id === id)),
    timeMs: z.number().finite().nonnegative().max(11000),
    camera: z.enum(['broadcast', 'tactical', 'touchline', 'orbit']),
    layers: z.object({ passing: z.boolean(), trails: z.boolean(), zones: z.boolean() }),
    playerId: z
      .string()
      .nullable()
      .refine((id) => id === null || players.some((p) => p.id === id)),
    orbit: z
      .object({
        position: z.tuple([
          z.number().finite().min(-500).max(500),
          z.number().finite().min(0.1).max(500),
          z.number().finite().min(-500).max(500),
        ]),
        target: z.tuple([
          z.number().finite().min(-100).max(100),
          z.number().finite().min(-10).max(20),
          z.number().finite().min(-100).max(100),
        ]),
      })
      .optional(),
  })
  .refine((view) => view.timeMs <= getMoment(view.momentId).durationMs);
export const savedViewSchema = z.object({
  id: z.string().uuid(),
  title: z.string().trim().min(1).max(70),
  note: z.string().max(600),
  createdAt: z.string().datetime(),
  view: viewSchema,
});
export type SavedView = z.infer<typeof savedViewSchema>;
export function encodeView(view: ViewState): string {
  const valid = viewSchema.parse(view);
  const params = new URLSearchParams({
    moment: valid.momentId,
    t: Math.round(valid.timeMs).toString(),
    camera: valid.camera,
    layers: Object.entries(valid.layers)
      .filter(([, on]) => on)
      .map(([key]) => key)
      .join(','),
  });
  if (valid.playerId) params.set('player', valid.playerId);
  if (valid.orbit && valid.camera === 'orbit') params.set('orbit', JSON.stringify(valid.orbit));
  return `/explorer?${params.toString()}`;
}
export function decodeView(search: string): { view: ViewState; warning: string | null } {
  const params = new URLSearchParams(search);
  if (!params.has('moment')) return { view: structuredClone(defaultView), warning: null };
  const layers = (params.get('layers') ?? 'passing').split(',');
  let orbit: unknown;
  try {
    orbit = params.has('orbit') ? JSON.parse(params.get('orbit')!) : undefined;
  } catch {
    return {
      view: structuredClone(defaultView),
      warning: 'That shared camera could not be read. The opening moment is ready instead.',
    };
  }
  const result = viewSchema.safeParse({
    momentId: params.get('moment'),
    timeMs: Number(params.get('t') ?? 0),
    camera: params.get('camera') ?? 'broadcast',
    layers: {
      passing: layers.includes('passing'),
      trails: layers.includes('trails'),
      zones: layers.includes('zones'),
    },
    playerId: params.get('player'),
    orbit,
  });
  return result.success
    ? { view: result.data, warning: null }
    : {
        view: structuredClone(defaultView),
        warning: 'That shared perspective could not be read. The opening moment is ready instead.',
      };
}
