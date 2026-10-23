import { useId } from 'react';
import { evaluateFrame, getMoment, type ViewState } from '../domain/match';

export default function FlatPitch({
  view,
  onSelect,
  compact = false,
}: {
  view: ViewState;
  onSelect?: (id: string) => void;
  compact?: boolean;
}) {
  const id = useId().replaceAll(':', '');
  const moment = getMoment(view.momentId);
  const frame = evaluateFrame(moment, view.timeMs);
  const map = (x: number, z: number) => ({ x: 640 + x * 8.1, y: 390 + z * 8.1 });
  const ball = map(frame.ball.x, frame.ball.z);
  return (
    <svg
      className="flat-pitch"
      viewBox="0 0 1280 800"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={`Tactical view: ${moment.title} at ${(view.timeMs / 1000).toFixed(1)} seconds`}
    >
      <defs>
        <radialGradient id={`${id}-bg`}>
          <stop stopColor="#1a3e3d" />
          <stop offset="1" stopColor="#0a1517" />
        </radialGradient>
        <linearGradient id={`${id}-grass`} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#285f4c" />
          <stop offset="1" stopColor="#153a31" />
        </linearGradient>
        <pattern id={`${id}-seats`} width="14" height="14" patternUnits="userSpaceOnUse">
          <rect x="3" y="3" width="7" height="5" rx="1" fill="#4a7468" opacity=".4" />
        </pattern>
        <filter id={`${id}-shadow`}>
          <feDropShadow dx="0" dy="4" stdDeviation="5" floodOpacity=".35" />
        </filter>
      </defs>
      <rect width="1280" height="800" fill={`url(#${id}-bg)`} />
      <rect
        x="105"
        y="48"
        width="1070"
        height="690"
        rx="170"
        fill="#183432"
        stroke="#466559"
        strokeWidth="2"
      />
      <rect x="118" y="60" width="1044" height="666" rx="160" fill={`url(#${id}-seats)`} />
      <rect
        x="184"
        y="95"
        width="912"
        height="592"
        rx="16"
        fill="#112a26"
        stroke="#8bb69c"
        strokeOpacity=".2"
        strokeWidth="5"
      />
      <rect x="207" y="115" width="866" height="550" fill={`url(#${id}-grass)`} />
      {Array.from({ length: 14 }, (_, i) => (
        <rect
          key={i}
          x={214.75 + i * 60.75}
          y="114.6"
          width="60.75"
          height="550.8"
          fill={i % 2 ? '#ffffff' : '#000000'}
          opacity=".035"
        />
      ))}
      <g fill="none" stroke="#c5e7d3" strokeOpacity=".5" strokeWidth="1.8">
        <rect x="214.75" y="114.6" width="850.5" height="550.8" />
        <path d="M640 114.6v550.8" />
        <circle cx="640" cy="390" r="74.1" />
        <path d="M214.75 226.7h133.6v326.6h-133.6M1065.25 226.7H931.6v326.6h133.65M214.75 315.8h44.55v148.4h-44.55M1065.25 315.8h-44.55v148.4h44.55" />
        <path d="M214.75 360.3h-17v59.4h17M1065.25 360.3h17v59.4h-17" strokeWidth="3" />
      </g>
      <circle cx="640" cy="390" r="3" fill="#c5e7d3" />
      {view.layers.zones &&
        [0, 1, 2].map((i) => (
          <rect
            key={i}
            x={640 + i * 141.75}
            y="116"
            width="141.75"
            height="548"
            fill={i % 2 ? '#e4d796' : '#b8efd3'}
            opacity=".09"
          />
        ))}
      {view.layers.trails &&
        Object.entries(moment.runs).map(([player, run]) => {
          const a = map(run[0].x, run[0].z),
            b = map(run[1].x, run[1].z);
          return (
            <path
              key={player}
              d={`M${a.x},${a.y}L${b.x},${b.y}`}
              stroke={player.startsWith('h') ? '#b8efd3' : '#f79579'}
              strokeWidth="2"
              strokeDasharray="4 6"
              opacity=".5"
            />
          );
        })}
      {view.layers.passing && (
        <polyline
          points={moment.ball
            .map((point) => {
              const p = map(point.x, point.z);
              return `${p.x},${p.y}`;
            })
            .join(' ')}
          fill="none"
          stroke="#e6e8ae"
          strokeWidth="2.2"
          strokeDasharray="5 7"
          opacity=".75"
        />
      )}
      {frame.positions.map((player) => {
        const p = map(player.x, player.z),
          selected = player.id === view.playerId;
        return (
          <g
            key={player.id}
            transform={`translate(${p.x},${p.y})`}
            onClick={() => onSelect?.(player.id)}
            style={{ cursor: onSelect ? 'pointer' : 'default' }}
            filter={`url(#${id}-shadow)`}
          >
            {selected && <circle r="21" fill="none" stroke="#fff9e5" strokeWidth="2" />}
            <circle
              r={compact ? 12 : 14}
              fill={player.team === 'home' ? '#b8efd3' : '#f79579'}
              stroke="#152f28"
              strokeWidth="2"
            />
            {!compact && (
              <text
                y="4.5"
                textAnchor="middle"
                fill="#102b24"
                fontFamily="sans-serif"
                fontWeight="700"
                fontSize="11"
              >
                {player.number}
              </text>
            )}
          </g>
        );
      })}
      <circle cx={ball.x} cy={ball.y} r="10" fill="#fff9df" opacity=".17" />
      <circle cx={ball.x} cy={ball.y} r="4.8" fill="#fff9df" stroke="#17362a" strokeWidth="1.6" />
      {!compact && (
        <g fill="#7f9d92" fontFamily="monospace" fontSize="10" letterSpacing="3">
          <text x="640" y="86" textAnchor="middle">
            RAFARENA / THE EVENING LEAGUE
          </text>
          <text x="640" y="712" textAnchor="middle">
            A DIFFERENT PERSPECTIVE.
          </text>
        </g>
      )}
    </svg>
  );
}
