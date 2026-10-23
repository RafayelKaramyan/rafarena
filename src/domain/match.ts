export type Point = { x: number; z: number };
export type CameraMode = 'broadcast' | 'tactical' | 'touchline' | 'orbit';
export type Layers = { passing: boolean; trails: boolean; zones: boolean };
export type ViewState = {
  momentId: string;
  timeMs: number;
  camera: CameraMode;
  layers: Layers;
  playerId: string | null;
  orbit?: { position: [number, number, number]; target: [number, number, number] };
};
export type Player = {
  id: string;
  number: number;
  name: string;
  role: string;
  team: 'home' | 'away';
  start: Point;
};
export type BallKey = Point & { at: number; height: number; label: string };
export type Moment = {
  id: string;
  title: string;
  subtitle: string;
  category: 'Build-up' | 'Transition' | 'Set piece';
  clock: string;
  matchSeconds: number;
  durationMs: number;
  description: string;
  insight: string;
  focus: string;
  ball: BallKey[];
  runs: Record<string, [Point, Point]>;
};

const home: [number, string, string, number, number][] = [
  [1, 'E. Navarro', 'Goalkeeper', -47, 0],
  [3, 'M. Silva', 'Left back', -28, -26],
  [4, 'I. Vale', 'Centre back', -32, -9],
  [5, 'L. Costa', 'Centre back', -32, 10],
  [2, 'N. Reyes', 'Right back', -27, 26],
  [6, 'T. Holden', 'Holding midfield', -14, 0],
  [8, 'M. Vega', 'Central midfield', -5, -14],
  [10, 'L. Moreau', 'Attacking midfield', 5, 9],
  [11, 'A. Nouri', 'Left wing', 16, -24],
  [9, 'R. Solano', 'Centre forward', 25, -2],
  [7, 'K. Tanaka', 'Right wing', 15, 25],
];
const away: [number, string, string, number, number][] = [
  [1, 'O. Voss', 'Goalkeeper', 48, 0],
  [2, 'D. Berg', 'Right back', 29, -27],
  [4, 'A. Hart', 'Centre back', 32, -8],
  [5, 'J. Laurent', 'Centre back', 32, 9],
  [3, 'S. Keller', 'Left back', 29, 27],
  [6, 'F. Marin', 'Holding midfield', 17, 2],
  [8, 'C. Reid', 'Central midfield', 9, -15],
  [10, 'R. Bell', 'Attacking midfield', 8, 16],
  [7, 'H. Diaz', 'Right wing', -10, -25],
  [9, 'A. Novak', 'Centre forward', -16, 0],
  [11, 'B. Ellis', 'Left wing', -11, 23],
];
export const players: Player[] = [
  ...home.map(([number, name, role, x, z]) => ({
    id: `h${number}`,
    number,
    name,
    role,
    team: 'home' as const,
    start: { x, z },
  })),
  ...away.map(([number, name, role, x, z]) => ({
    id: `a${number}`,
    number,
    name,
    role,
    team: 'away' as const,
    start: { x, z },
  })),
];
export const moments: Moment[] = [
  {
    id: 'between-the-lines',
    title: 'Between the lines.',
    subtitle: 'A little space. A different game.',
    category: 'Build-up',
    clock: '67:24',
    matchSeconds: 4044,
    durationMs: 10000,
    description:
      'Moreau finds the pocket. Solano makes the run. One pass turns a compact block into an open invitation.',
    insight:
      'Watch the number 10 draw the holding midfielder forward before releasing the runner behind the defensive line.',
    focus: 'h10',
    ball: [
      { at: 0, x: -14, z: 0, height: 0.4, label: 'Holden in possession' },
      { at: 2200, x: -5, z: -14, height: 0.4, label: 'Vega receives' },
      { at: 4400, x: 14, z: 8, height: 0.4, label: 'Moreau between the lines' },
      { at: 7500, x: 40, z: -6, height: 0.4, label: 'Solano breaks the line' },
      { at: 10000, x: 52, z: -2, height: 1.1, label: 'The finish' },
    ],
    runs: {
      h10: [
        { x: 5, z: 9 },
        { x: 25, z: 7 },
      ],
      h9: [
        { x: 25, z: -2 },
        { x: 46, z: -6 },
      ],
      a6: [
        { x: 17, z: 2 },
        { x: 12, z: 6 },
      ],
      a4: [
        { x: 32, z: -8 },
        { x: 40, z: -9 },
      ],
    },
  },
  {
    id: 'the-far-side',
    title: 'The far side.',
    subtitle: 'Move the block. Find the space.',
    category: 'Build-up',
    clock: '42:18',
    matchSeconds: 2538,
    durationMs: 11000,
    description:
      'A patient exchange on the left pulls Union across. The diagonal switch gives Tanaka a whole flank to attack.',
    insight:
      'Follow the flight of the diagonal and the right winger’s starting position outside the defensive shape.',
    focus: 'h7',
    ball: [
      { at: 0, x: -28, z: -26, height: 0.4, label: 'Silva holds the width' },
      { at: 2000, x: -5, z: -14, height: 0.4, label: 'Vega opens up' },
      { at: 6000, x: 24, z: 28, height: 0.4, label: 'The switch finds Tanaka' },
      { at: 8500, x: 39, z: 20, height: 0.4, label: 'Driving inside' },
      { at: 11000, x: 49, z: 4, height: 1, label: 'The delivery' },
    ],
    runs: {
      h7: [
        { x: 15, z: 29 },
        { x: 42, z: 17 },
      ],
      h9: [
        { x: 25, z: -2 },
        { x: 47, z: 4 },
      ],
      a3: [
        { x: 29, z: 20 },
        { x: 40, z: 21 },
      ],
    },
  },
  {
    id: 'turn-and-go',
    title: 'Turn. And go.',
    subtitle: 'Eight seconds to change everything.',
    category: 'Transition',
    clock: '78:03',
    matchSeconds: 4683,
    durationMs: 8000,
    description:
      'A recovery in midfield becomes a direct counter. Four touches, three runners and an exposed back line.',
    insight:
      'Holden’s first forward touch is the trigger. The wide runs make room for the ball carrier through the centre.',
    focus: 'h6',
    ball: [
      { at: 0, x: -20, z: 3, height: 0.4, label: 'Possession recovered' },
      { at: 1800, x: 0, z: 3, height: 0.4, label: 'Holden drives forward' },
      { at: 4000, x: 20, z: -14, height: 0.4, label: 'Nouri on the move' },
      { at: 6200, x: 37, z: -5, height: 0.4, label: 'Solano takes over' },
      { at: 8000, x: 52, z: 3, height: 0.9, label: 'Shot across goal' },
    ],
    runs: {
      h6: [
        { x: -20, z: 3 },
        { x: 17, z: 3 },
      ],
      h11: [
        { x: -3, z: -24 },
        { x: 31, z: -15 },
      ],
      h9: [
        { x: 8, z: -2 },
        { x: 45, z: -5 },
      ],
      h7: [
        { x: 0, z: 25 },
        { x: 33, z: 23 },
      ],
    },
  },
  {
    id: 'blind-side',
    title: 'The blind side.',
    subtitle: 'Timing is the extra player.',
    category: 'Set piece',
    clock: '21:46',
    matchSeconds: 1306,
    durationMs: 8500,
    description:
      'A short corner changes the angle. Costa waits, then attacks the far-post space as the defence turns toward the ball.',
    insight:
      'Track Costa from the edge of the area. The delayed run arrives after the centre backs have set their positions.',
    focus: 'h5',
    ball: [
      { at: 0, x: 51, z: -33, height: 0.4, label: 'The short corner' },
      { at: 1800, x: 40, z: -27, height: 0.4, label: 'Moreau returns the angle' },
      { at: 3900, x: 47, z: -25, height: 0.4, label: 'Nouri delivers' },
      { at: 6900, x: 47, z: 6, height: 2.4, label: 'Costa at the far post' },
      { at: 8500, x: 52, z: 1, height: 1, label: 'The header' },
    ],
    runs: {
      h11: [
        { x: 51, z: -33 },
        { x: 47, z: -25 },
      ],
      h10: [
        { x: 40, z: -27 },
        { x: 41, z: -20 },
      ],
      h5: [
        { x: 34, z: 10 },
        { x: 48, z: 5 },
      ],
      h9: [
        { x: 42, z: -3 },
        { x: 48, z: -5 },
      ],
      a4: [
        { x: 45, z: -7 },
        { x: 47, z: -6 },
      ],
      a5: [
        { x: 44, z: 5 },
        { x: 46, z: 2 },
      ],
    },
  },
  {
    id: 'win-it-high',
    title: 'Win it high.',
    subtitle: 'The press is a team sport.',
    category: 'Transition',
    clock: '34:10',
    matchSeconds: 2050,
    durationMs: 9000,
    description:
      'Solace closes the return pass and forces play into a narrow channel. Vega arrives for the interception.',
    insight:
      'The pressing triangle closes together. The recovery is a consequence of the shape, rather than one isolated challenge.',
    focus: 'h8',
    ball: [
      { at: 0, x: 44, z: 0, height: 0.4, label: 'Union builds from the back' },
      { at: 2200, x: 30, z: -22, height: 0.4, label: 'The channel closes' },
      { at: 4200, x: 24, z: -10, height: 0.4, label: 'Vega intercepts' },
      { at: 6700, x: 41, z: 0, height: 0.4, label: 'The release to Solano' },
      { at: 9000, x: 52, z: -3, height: 0.7, label: 'Shot on goal' },
    ],
    runs: {
      h8: [
        { x: 15, z: -14 },
        { x: 31, z: -8 },
      ],
      h9: [
        { x: 31, z: 0 },
        { x: 46, z: 0 },
      ],
      h11: [
        { x: 21, z: -26 },
        { x: 30, z: -23 },
      ],
      a1: [
        { x: 44, z: 0 },
        { x: 48, z: -1 },
      ],
    },
  },
  {
    id: 'outside-lane',
    title: 'The outside lane.',
    subtitle: 'Two runs. One decision.',
    category: 'Build-up',
    clock: '55:32',
    matchSeconds: 3332,
    durationMs: 10000,
    description:
      'Tanaka comes inside as Reyes runs around him. The full back has to choose, opening a route to the byline.',
    insight:
      'Look at the change in width as the winger comes infield. The overlap gives the attack a second direction.',
    focus: 'h2',
    ball: [
      { at: 0, x: 5, z: 24, height: 0.4, label: 'Tanaka receives wide' },
      { at: 2800, x: 18, z: 15, height: 0.4, label: 'The winger comes inside' },
      { at: 5500, x: 33, z: 29, height: 0.4, label: 'Reyes on the overlap' },
      { at: 7800, x: 48, z: 24, height: 0.4, label: 'At the byline' },
      { at: 10000, x: 44, z: 0, height: 0.4, label: 'The cutback' },
    ],
    runs: {
      h2: [
        { x: -2, z: 29 },
        { x: 49, z: 24 },
      ],
      h7: [
        { x: 5, z: 24 },
        { x: 27, z: 13 },
      ],
      h9: [
        { x: 25, z: -2 },
        { x: 44, z: 0 },
      ],
      a3: [
        { x: 29, z: 27 },
        { x: 36, z: 19 },
      ],
    },
  },
];

export const defaultView: ViewState = {
  momentId: moments[0]!.id,
  timeMs: 3600,
  camera: 'broadcast',
  layers: { passing: true, trails: false, zones: false },
  playerId: null,
};
export const cameraNames: Record<CameraMode, string> = {
  broadcast: 'Broadcast',
  tactical: 'Top-down',
  touchline: 'Touchline',
  orbit: 'Free orbit',
};
export function getMoment(id: string): Moment {
  return moments.find((moment) => moment.id === id) ?? moments[0]!;
}
export function clampTime(moment: Moment, timeMs: number): number {
  return Math.max(0, Math.min(moment.durationMs, Number.isFinite(timeMs) ? timeMs : 0));
}
export function lerpPoint(a: Point, b: Point, t: number): Point {
  return { x: a.x + (b.x - a.x) * t, z: a.z + (b.z - a.z) * t };
}
export function evaluateFrame(moment: Moment, rawTimeMs: number) {
  const timeMs = clampTime(moment, rawTimeMs);
  const progress = timeMs / moment.durationMs;
  const segmentIndex = Math.min(
    moment.ball.length - 2,
    Math.max(0, moment.ball.findIndex((key) => key.at > timeMs) - 1),
  );
  const index = timeMs >= moment.durationMs ? moment.ball.length - 2 : segmentIndex;
  const a = moment.ball[index]!;
  const b = moment.ball[index + 1]!;
  const fraction = Math.max(0, Math.min(1, (timeMs - a.at) / (b.at - a.at)));
  const ball = lerpPoint(a, b, fraction);
  const flight =
    moment.id === 'the-far-side' && index === 1
      ? 8
      : moment.id === 'blind-side' && index === 2
        ? 7
        : 0.35;
  const height =
    a.height + (b.height - a.height) * fraction + Math.sin(fraction * Math.PI) * flight;
  const positions = players.map((player) => {
    const run = moment.runs[player.id];
    const start = run?.[0] ?? player.start;
    const end = run?.[1] ?? {
      x: start.x + (player.team === 'home' ? 4 : 3) * Math.sin(player.number * 0.7),
      z: start.z + 2 * Math.cos(player.number),
    };
    const position = lerpPoint(start, end, progress);
    return { ...player, ...position, origin: start };
  });
  return {
    timeMs,
    progress,
    ball: { ...ball, y: height },
    positions,
    event: timeMs === moment.durationMs ? b.label : a.label,
    segment: index,
  };
}
export function clockLabel(moment: Moment, timeMs: number): string {
  const seconds = moment.matchSeconds + Math.floor(clampTime(moment, timeMs) / 1000);
  return `${Math.floor(seconds / 60)
    .toString()
    .padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
}
export function progression(moment: Moment): number {
  return Math.round(moment.ball.at(-1)!.x - moment.ball[0]!.x);
}
export function advanceTime(
  current: number,
  deltaMs: number,
  duration: number,
  speed: number,
  loop: boolean,
) {
  const next = Math.max(0, current) + Math.max(0, Math.min(deltaMs, 100)) * speed;
  return next >= duration
    ? { timeMs: loop ? next % duration : duration, ended: !loop }
    : { timeMs: next, ended: false };
}
