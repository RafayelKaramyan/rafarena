import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  Bookmark,
  Check,
  ChevronDown,
  Circle,
  Focus,
  Layers2,
  MoveUpRight,
  Pause,
  Play,
  Repeat2,
  RotateCcw,
  Share2,
  Sparkles,
  X,
} from 'lucide-react';
import {
  cameraNames,
  clockLabel,
  evaluateFrame,
  getMoment,
  moments,
  players,
  progression,
  type CameraMode,
  type ViewState,
} from '../domain/match';
import type { Replay } from '../domain/replay';
import { encodeView } from '../domain/views';
import type { SavedView } from '../domain/views';
import Stage, { type StageHandle } from '../ui/Stage';
import Dialog from '../ui/Dialog';
import ViewForm from '../ui/ViewForm';
import FlatPitch from '../ui/FlatPitch';
import { Link } from 'react-router-dom';

type Props = {
  view: ViewState;
  setView: (update: ViewState | ((view: ViewState) => ViewState)) => void;
  replay: Replay;
  save: (value: SavedView) => Promise<void>;
  notify: (message: string) => void;
};

export default function Explorer({ view, setView, replay, save, notify }: Props) {
  const transport = useSyncExternalStore(replay.subscribe, replay.snapshot);
  const current = { ...view, timeMs: transport.timeMs };
  const moment = getMoment(view.momentId),
    frame = evaluateFrame(moment, transport.timeMs);
  const [saveView, setSaveView] = useState<ViewState | null>(null),
    [shareView, setShareView] = useState<string | null>(null);
  const [focused, setFocused] = useState(false),
    [help, setHelp] = useState(false);
  const stage = useRef<StageHandle>(null);
  const stageArea = useRef<HTMLDivElement>(null);
  const selected = players.find((player) => player.id === view.playerId);
  const index = moments.findIndex((m) => m.id === moment.id);
  const capture = () => ({
    ...current,
    orbit: view.camera === 'orbit' ? stage.current?.pose() : view.orbit,
  });
  const select = (id: string) =>
    setView((old) => ({ ...old, playerId: old.playerId === id ? null : id }));
  const changeMoment = (id: string) => {
    replay.configure(getMoment(id).durationMs, 0);
    setView((old) => ({ ...old, momentId: id, timeMs: 0, playerId: null }));
  };
  useEffect(() => {
    const key = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (
        target.closest('input, textarea, select, button, a, dialog') ||
        event.ctrlKey ||
        event.metaKey ||
        event.altKey
      )
        return;
      if (event.code === 'Space') {
        event.preventDefault();
        replay.toggle();
      }
      if (event.code === 'ArrowRight') {
        event.preventDefault();
        replay.seek(replay.snapshot().timeMs + 250);
      }
      if (event.code === 'ArrowLeft') {
        event.preventDefault();
        replay.seek(replay.snapshot().timeMs - 250);
      }
    };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, [replay]);
  useEffect(() => {
    if (!focused) return;
    const area = stageArea.current!;
    const previous = document.activeElement;
    const surrounding = [
      document.querySelector<HTMLElement>('.site-header'),
      document.querySelector<HTMLElement>('.site-footer'),
      ...Array.from(area.parentElement?.children ?? []).filter(
        (node) => node !== area && node.tagName !== 'DIALOG',
      ),
    ].filter((node): node is HTMLElement => node instanceof HTMLElement);
    const previousInert = surrounding.map((node) => node.inert);
    surrounding.forEach((node) => {
      node.inert = true;
    });
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    area.querySelector<HTMLElement>('.focus-close')?.focus();
    const key = (event: KeyboardEvent) => {
      if (document.querySelector('dialog[open]')) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        setFocused(false);
      }
      if (event.key === 'Tab') {
        const controls = Array.from(
          area.querySelectorAll<HTMLElement>('button, input, select, a[href]'),
        ).filter((node) => node.getClientRects().length > 0 && !node.hasAttribute('disabled'));
        const first = controls[0],
          last = controls.at(-1);
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener('keydown', key);
    return () => {
      document.removeEventListener('keydown', key);
      surrounding.forEach((node, index) => {
        node.inert = previousInert[index]!;
      });
      document.body.style.overflow = overflow;
      if (previous instanceof HTMLElement && previous.isConnected) previous.focus();
    };
  }, [focused]);
  const downloadImage = async () => {
    replay.pause();
    try {
      const blob = await stage.current?.png();
      if (!blob) throw new Error('The pitch is still preparing. Try again in a moment.');
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `rafarena-${moment.id}-${Math.round(replay.snapshot().timeMs)}.png`;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 10000);
      notify('Pitch image downloaded. A different perspective, ready to keep.');
    } catch (cause) {
      notify(cause instanceof Error ? cause.message : 'The pitch image could not be created.');
    }
  };
  const share = () => {
    replay.pause();
    const url = new URL(window.location.href);
    url.hash = encodeView(capture());
    setShareView(url.toString());
  };
  return (
    <>
      <section className="intro-row">
        <div className="eyebrow">
          <span className="live-square" /> THE REPLAY ROOM <span className="muted">/ 01</span>
        </div>
        <div className="fixture-tag">
          <span>THE EVENING LEAGUE</span>
          <i />
          MATCHDAY 08<span className="fictional">FICTIONAL FIXTURE</span>
        </div>
      </section>
      <div className="explorer-heading">
        <h1>
          The game.
          <br />
          <em>A different perspective.</em>
        </h1>
        <div className="heading-aside">
          <span className="tiny-star">✳</span>
          <p>
            Find the space.
            <br />
            Follow the idea.
            <br />
            <strong>See what changes the game.</strong>
          </p>
        </div>
      </div>
      <div className={`replay-workspace ${focused ? 'focus-mode' : ''}`} ref={stageArea}>
        {focused && (
          <button className="focus-close button secondary" onClick={() => setFocused(false)}>
            <X size={16} /> Exit focus view
          </button>
        )}
        <div className="match-bar">
          <div className="match-teams">
            <TeamBadge team="home" />
            <span className="team-name">Solace FC</span>
            <strong className="match-score">
              2<span>—</span>1
            </strong>
            <span className="team-name">Union 04</span>
            <TeamBadge team="away" />
            <span className="match-period">2ND HALF</span>
          </div>
          <div className="match-tools">
            <span
              className="match-clock"
              aria-label={`Match time ${clockLabel(moment, transport.timeMs)}`}
            >
              {clockLabel(moment, transport.timeMs)}
            </span>
            <button
              className="icon-button"
              aria-label="Share perspective"
              title="Share perspective"
              onClick={share}
            >
              <Share2 size={17} />
            </button>
            <button
              className="button save-button"
              onClick={() => {
                replay.pause();
                setSaveView(capture());
              }}
            >
              <Bookmark size={15} />
              <span>Save view</span>
              <ArrowUpRight size={14} />
            </button>
          </div>
        </div>
        <div className="arena-grid">
          <div className="arena-main">
            <Stage
              ref={stage}
              view={current}
              replay={replay}
              onSelect={select}
              onImage={() => {
                void downloadImage();
              }}
              onFocus={() => setFocused(true)}
            />
            <div className="camera-bar">
              <div className="camera-caption">
                <Focus size={15} />
                <span>YOUR ANGLE</span>
              </div>
              <div className="camera-presets" role="group" aria-label="Camera angles">
                {(Object.keys(cameraNames) as CameraMode[]).map((camera, i) => (
                  <button
                    key={camera}
                    aria-pressed={view.camera === camera}
                    className={view.camera === camera ? 'active' : ''}
                    onClick={() => setView((old) => ({ ...old, camera }))}
                  >
                    <span className="preset-num">0{i + 1}</span>
                    {cameraNames[camera]}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <aside className="insight-panel" aria-label="Moment analysis">
            <div className="insight-kicker">
              <span>THE DECISIVE MOMENT</span>
              <span>0{index + 1}/06</span>
            </div>
            <div className="moment-category">
              <i />
              {moment.category}
            </div>
            <h2>{moment.title}</h2>
            <p className="moment-description">{moment.description}</p>
            <div className="moment-stats">
              <div>
                <strong>
                  {progression(moment)}
                  <small>m</small>
                </strong>
                <span>FORWARD GAIN</span>
              </div>
              <div>
                <strong>{moment.ball.length - 1}</strong>
                <span>BALL ACTIONS</span>
              </div>
              <div>
                <strong>
                  {moment.durationMs / 1000}
                  <small>s</small>
                </strong>
                <span>THE SEQUENCE</span>
              </div>
            </div>
            <div className="coach-note">
              <Sparkles size={16} />
              <div>
                <span>LOOK A LITTLE CLOSER</span>
                <p>{moment.insight}</p>
              </div>
            </div>
            <button
              className="text-button focus-player"
              onClick={() => setView((old) => ({ ...old, playerId: moment.focus }))}
            >
              Follow #{players.find((p) => p.id === moment.focus)!.number}{' '}
              {players.find((p) => p.id === moment.focus)!.name}
              <ArrowUpRight size={15} />
            </button>
            <div className="insight-bottom">
              <span className="minute-label">
                {moment.clock}
                <span>START OF SEQUENCE</span>
              </span>
              <button
                className="round-button"
                aria-label="Play selected moment"
                onClick={() => {
                  replay.seek(0);
                  replay.play();
                }}
              >
                <Play size={18} fill="currentColor" />
              </button>
            </div>
          </aside>
        </div>
        <div className="transport" role="region" aria-label="Replay timeline">
          <div className="transport-top">
            <div className="transport-play">
              <button
                className="icon-button"
                aria-label="Restart sequence"
                onClick={() => replay.seek(0)}
              >
                <RotateCcw size={17} />
              </button>
              <button
                className="play-button"
                aria-label={transport.playing ? 'Pause replay' : 'Play replay'}
                onClick={() => replay.toggle()}
              >
                {transport.playing ? (
                  <Pause size={19} fill="currentColor" />
                ) : (
                  <Play size={19} fill="currentColor" />
                )}
              </button>
              <span className="transport-time">
                {(transport.timeMs / 1000).toFixed(1)}
                <span> / {(moment.durationMs / 1000).toFixed(1)}s</span>
              </span>
            </div>
            <span className="frame-caption">
              <i />
              {frame.event}
            </span>
            <div className="transport-options">
              <div className="speed-options" role="group" aria-label="Replay speed">
                {[0.5, 1, 2].map((speed) => (
                  <button
                    key={speed}
                    aria-pressed={transport.speed === speed}
                    className={speed === transport.speed ? 'active' : ''}
                    onClick={() => replay.setSpeed(speed)}
                  >
                    {speed}×
                  </button>
                ))}
              </div>
              <button
                className={`icon-button ${transport.loop ? 'selected-icon' : ''}`}
                aria-label="Loop sequence"
                aria-pressed={transport.loop}
                onClick={() => replay.toggleLoop()}
              >
                <Repeat2 size={17} />
              </button>
              <button
                className="keyboard-help"
                aria-label="Keyboard shortcuts"
                onClick={() => setHelp(true)}
              >
                ?
              </button>
            </div>
          </div>
          <div className="time-track">
            <div className="time-ticks">
              <span>00</span>
              <span>{(moment.durationMs / 4000).toFixed(1)}</span>
              <span>{(moment.durationMs / 2000).toFixed(1)}</span>
              <span>{(moment.durationMs * 0.00075).toFixed(1)}</span>
              <span>{moment.durationMs / 1000}s</span>
            </div>
            <div
              className="scrubber"
              style={{ '--progress': `${frame.progress * 100}%` } as React.CSSProperties}
            >
              <div className="scrub-fill" />
              <div className="event-marks" aria-hidden="true">
                {moment.ball.map((key, n) => (
                  <span key={n} style={{ left: `${(key.at / moment.durationMs) * 100}%` }} />
                ))}
              </div>
              <input
                type="range"
                aria-label="Replay position"
                min="0"
                max={moment.durationMs}
                step="10"
                value={transport.timeMs}
                onChange={(event) => replay.seek(Number(event.target.value))}
              />
            </div>
          </div>
          <div className="timeline-bottom">
            <span>AUTHORED MOVEMENT · NOT A LIVE FEED</span>
            <button
              onClick={() => {
                replay.pause();
                changeMoment(moments[(index + 1) % moments.length]!.id);
              }}
            >
              Next moment
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
      <section className="explore-tools" aria-label="Analysis controls">
        <div className="layer-controls">
          <span className="control-title">
            <Layers2 size={16} /> MAKE IT VISIBLE
          </span>
          {(['passing', 'trails', 'zones'] as const).map((layer) => (
            <button
              key={layer}
              className={`layer-toggle ${view.layers[layer] ? 'active' : ''}`}
              aria-pressed={view.layers[layer]}
              onClick={() =>
                setView((old) => ({
                  ...old,
                  layers: { ...old.layers, [layer]: !old.layers[layer] },
                }))
              }
            >
              {view.layers[layer] ? <Check size={13} /> : <Circle size={13} />}
              {{ passing: 'Ball path', trails: 'Player runs', zones: 'Pitch thirds' }[layer]}
            </button>
          ))}
        </div>
        <div className="player-select">
          <label htmlFor="player-focus">PLAYER FOCUS</label>
          <div className="select-wrap">
            <select
              id="player-focus"
              value={view.playerId ?? ''}
              onChange={(event) =>
                setView((old) => ({ ...old, playerId: event.target.value || null }))
              }
            >
              <option value="">See the whole team</option>
              {(['home', 'away'] as const).map((team) => (
                <optgroup key={team} label={team === 'home' ? 'Solace FC' : 'Union 04'}>
                  {players
                    .filter((player) => player.team === team)
                    .map((player) => (
                      <option key={player.id} value={player.id}>
                        #{player.number} {player.name} · {player.role}
                      </option>
                    ))}
                </optgroup>
              ))}
            </select>
            <ChevronDown size={14} />
          </div>
        </div>
      </section>
      {selected && (
        <div className="player-focus-bar" role="status">
          <div className={`shirt-number ${selected.team}`}>{selected.number}</div>
          <div>
            <strong>{selected.name}</strong>
            <span>
              {selected.role} / {selected.team === 'home' ? 'Solace FC' : 'Union 04'}
            </span>
          </div>
          <span className="player-position">
            X {frame.positions.find((p) => p.id === selected.id)!.x.toFixed(1)}m <span> / </span> Z{' '}
            {frame.positions.find((p) => p.id === selected.id)!.z.toFixed(1)}m
          </span>
          <button
            className="icon-button"
            aria-label="Clear player focus"
            onClick={() => setView((old) => ({ ...old, playerId: null }))}
          >
            <X size={16} />
          </button>
        </div>
      )}
      <section className="moment-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">THERE IS ALWAYS ANOTHER ANGLE</span>
            <h2>
              Six moments.<em> One game.</em>
            </h2>
          </div>
          <Link className="text-button" to="/moments">
            Explore the moments
            <ArrowUpRight size={17} />
          </Link>
        </div>
        <div className="moment-filmstrip">
          {moments.map((item, i) => (
            <button
              key={item.id}
              className={`film-card ${moment.id === item.id ? 'active' : ''}`}
              onClick={() => changeMoment(item.id)}
              aria-pressed={moment.id === item.id}
            >
              <div className="film-image">
                <FlatPitch
                  view={{
                    ...view,
                    momentId: item.id,
                    timeMs: item.durationMs * 0.55,
                    playerId: null,
                  }}
                  compact
                />
                <span className="film-index">0{i + 1}</span>
                <span className="film-time">{item.clock}</span>
                <span className="film-arrow">
                  <ArrowUpRight size={17} />
                </span>
              </div>
              <div className="film-caption">
                <span>{item.title}</span>
                {moment.id === item.id ? (
                  <span className="now-playing">SELECTED</span>
                ) : (
                  <span>{item.category}</span>
                )}
              </div>
            </button>
          ))}
        </div>
      </section>
      <section className="closing-note">
        <MoveUpRight size={29} />
        <p>
          The details make the difference.
          <br />
          <em>Take another look.</em>
        </p>
        <div>
          <span>22 PLAYERS. EVERY PERSPECTIVE.</span>
          <span>REACT / TYPESCRIPT / THREE.JS</span>
        </div>
      </section>
      {saveView && (
        <ViewForm
          view={saveView}
          save={save}
          onClose={() => setSaveView(null)}
          onSaved={() => notify('Perspective saved. Find it in Saved views.')}
        />
      )}
      {shareView && <ShareDialog url={shareView} onClose={() => setShareView(null)} />}
      {help && (
        <Dialog title="A few quick moves." onClose={() => setHelp(false)}>
          <div className="shortcut-list">
            <div>
              <span>Play / pause</span>
              <kbd>Space</kbd>
            </div>
            <div>
              <span>Move 0.25s through the replay</span>
              <kbd>← / →</kbd>
            </div>
            <div>
              <span>Leave focus view</span>
              <kbd>Esc</kbd>
            </div>
            <div>
              <span>Free orbit camera</span>
              <span>Drag the pitch</span>
            </div>
          </div>
          <p className="fine-print">
            Timeline arrows also work while the slider is focused. Choose players with the Player
            focus menu.
          </p>
        </Dialog>
      )}
    </>
  );
}

export function TeamBadge({ team }: { team: 'home' | 'away' }) {
  return (
    <svg className={`team-badge ${team}`} viewBox="0 0 32 36" aria-hidden="true">
      <path
        d="M3 3h26v19L16 33 3 22Z"
        fill="currentColor"
        opacity=".12"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      {team === 'home' ? (
        <path d="m9 23 7-14 7 14M12 19h8" stroke="currentColor" fill="none" strokeWidth="2" />
      ) : (
        <path d="M10 10v10q6 8 12 0V10" stroke="currentColor" fill="none" strokeWidth="2" />
      )}
    </svg>
  );
}
function ShareDialog({ url, onClose }: { url: string; onClose: () => void }) {
  const [status, setStatus] = useState('');
  return (
    <Dialog title="A view worth sharing." onClose={onClose}>
      <p className="dialog-intro">
        Open this link to the same moment, time, camera and layers. Your saved title and private
        notes stay here.
      </p>
      <label className="field">
        Perspective link
        <input autoFocus readOnly value={url} onFocus={(event) => event.target.select()} />
      </label>
      <button
        className="button primary form-submit"
        onClick={() => {
          if (!navigator.clipboard) {
            setStatus('Select the link above and copy it manually.');
            return;
          }
          void navigator.clipboard
            .writeText(url)
            .then(() => setStatus('Perspective link copied.'))
            .catch(() => setStatus('Select the link above and copy it manually.'));
        }}
      >
        Copy perspective link
        <ArrowUpRight size={17} />
      </button>
      <p className="share-status" role="status">
        {status || 'No account or saved project is required to open this view.'}
      </p>
    </Dialog>
  );
}
