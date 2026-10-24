import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { defaultView, type ViewState } from '../domain/match';
import { encodeView } from '../domain/views';
import { Replay } from '../domain/replay';
import Stage, { type StageHandle } from './Stage';
import FlatPitch from './FlatPitch';

export default function StadiumTeaser({ notify }: { notify: (message: string) => void }) {
  const [ready, setReady] = useState(false),
    [view, setView] = useState<ViewState>({ ...defaultView, timeMs: 3600 });
  const [replay] = useState(() => new Replay());
  const root = useRef<HTMLDivElement>(null),
    stage = useRef<StageHandle>(null);
  const navigate = useNavigate();
  const open = () =>
    navigate(
      encodeView({ ...view, orbit: view.camera === 'orbit' ? stage.current?.pose() : undefined }),
    );
  useEffect(() => {
    if (!('IntersectionObserver' in window)) {
      setReady(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setReady(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' },
    );
    if (root.current) observer.observe(root.current);
    return () => observer.disconnect();
  }, []);
  useEffect(() => () => replay.destroy(), [replay]);
  const download = async () => {
    try {
      const blob = await stage.current?.png();
      if (!blob) throw new Error('Open the replay room to download this perspective.');
      const url = URL.createObjectURL(blob),
        anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = 'rafarena-perspective.png';
      anchor.click();
      setTimeout(() => URL.revokeObjectURL(url), 10000);
      notify('Your pitch image is ready to keep.');
    } catch (error) {
      notify(error instanceof Error ? error.message : 'The image could not be downloaded.');
    }
  };
  return (
    <div className="lab-visual" ref={root}>
      <div className="lab-visual-heading">
        <span>YOUR NEXT PERSPECTIVE</span>
        <span>01 / 06</span>
      </div>
      {ready ? (
        <Stage
          ref={stage}
          view={view}
          replay={replay}
          onSelect={(id) =>
            setView((old) => ({ ...old, playerId: old.playerId === id ? null : id }))
          }
          onImage={() => {
            void download();
          }}
          onFocus={open}
        />
      ) : (
        <div className="lab-pitch-placeholder">
          <FlatPitch view={view} />
        </div>
      )}
      <div className="lab-camera-options" role="group" aria-label="Preview camera">
        {(
          [
            ['broadcast', 'Broadcast'],
            ['tactical', 'Top-down'],
            ['orbit', 'Free orbit'],
          ] as const
        ).map(([camera, name], index) => (
          <button
            key={camera}
            aria-pressed={view.camera === camera}
            onClick={() => setView((old) => ({ ...old, camera }))}
          >
            <span>0{index + 1}</span>
            {name}
          </button>
        ))}
        <button
          className="lab-enter"
          onClick={open}
          aria-label="Explore this perspective in the replay room"
        >
          <ArrowUpRight size={22} />
        </button>
      </div>
    </div>
  );
}
