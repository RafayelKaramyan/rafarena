import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Box, ScanLine, Rotate3D, Download, Expand, ArrowUpRight } from 'lucide-react';
import type { ViewState } from '../domain/match';
import type { Replay } from '../domain/replay';
import type { StadiumEngine } from '../scene/engine';
import FlatPitch from './FlatPitch';

export type StageHandle = { pose: () => ViewState['orbit']; png: () => Promise<Blob> };
async function svgPng(svg: SVGSVGElement): Promise<Blob> {
  const image = new Image();
  const url = URL.createObjectURL(
    new Blob([new XMLSerializer().serializeToString(svg)], { type: 'image/svg+xml;charset=utf-8' }),
  );
  try {
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error('The tactical frame could not be exported.'));
      image.src = url;
    });
    const canvas = document.createElement('canvas');
    canvas.width = 1920;
    canvas.height = 1200;
    canvas.getContext('2d')!.drawImage(image, 0, 0, 1920, 1200);
    return await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error('The frame could not be exported.'))),
        'image/png',
      ),
    );
  } finally {
    URL.revokeObjectURL(url);
  }
}
const Stage = forwardRef<
  StageHandle,
  {
    view: ViewState;
    replay: Replay;
    onSelect: (id: string) => void;
    onImage: () => void;
    onFocus: () => void;
  }
>(function Stage({ view, replay, onSelect, onImage, onFocus }, ref) {
  const host = useRef<HTMLDivElement>(null),
    flat = useRef<HTMLDivElement>(null);
  const engine = useRef<StadiumEngine | null>(null);
  const latest = useRef({ view, onSelect });
  latest.current = { view, onSelect };
  const [requested, setRequested] = useState<'3d' | '2d'>('3d');
  const [status, setStatus] = useState<'loading' | '3d' | 'fallback' | '2d'>('loading');
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let cancelled = false;
    let unsubscribe: (() => void) | undefined;
    if (requested === '2d') {
      setStatus('2d');
      return;
    }
    setStatus('loading');
    void import('../scene/engine')
      .then(({ StadiumEngine: Engine }) => {
        if (cancelled || !host.current) return;
        try {
          const instance = new Engine(
            host.current,
            latest.current.view,
            (id) => latest.current.onSelect(id),
            () => {
              unsubscribe?.();
              setStatus('fallback');
              instance.destroy();
              engine.current = null;
            },
          );
          engine.current = instance;
          unsubscribe = replay.onFrame((timeMs) => instance.setTime(timeMs));
          setStatus('3d');
        } catch {
          if (!cancelled) {
            host.current?.replaceChildren();
            setStatus('fallback');
          }
        }
      })
      .catch(() => {
        if (!cancelled) setStatus('fallback');
      });
    return () => {
      cancelled = true;
      unsubscribe?.();
      engine.current?.destroy();
      engine.current = null;
    };
  }, [requested, replay, attempt]);
  useEffect(() => {
    engine.current?.setView(view);
  }, [view]);
  useImperativeHandle(
    ref,
    () => ({
      pose: () => engine.current?.getPose() ?? view.orbit,
      png: async () => {
        if (engine.current) return engine.current.png();
        const svg = flat.current?.querySelector('svg');
        if (!svg) throw new Error('Wait for the pitch to become ready.');
        return svgPng(svg);
      },
    }),
    [view],
  );
  const isFlat = status !== '3d';
  return (
    <div className="stage" role="region" aria-label="Interactive match pitch">
      <div className="stage-ambient" aria-hidden="true" />
      <div className="stage-top">
        <span className="stage-live">
          <i />{' '}
          {status === 'loading'
            ? 'Preparing the stadium'
            : status === '3d'
              ? 'Three.js / 3D replay'
              : 'Tactical / 2D replay'}
        </span>
        <span className="stage-coordinate">
          22 PLAYERS / SCENARIO 0
          {1 +
            [
              'between-the-lines',
              'the-far-side',
              'turn-and-go',
              'blind-side',
              'win-it-high',
              'outside-lane',
            ].indexOf(view.momentId)}
        </span>
      </div>
      <div className={`webgl-host ${isFlat ? 'is-hidden' : ''}`} ref={host} />
      {isFlat && (
        <div className="flat-host" ref={flat}>
          <FlatPitch view={view} onSelect={onSelect} />
        </div>
      )}
      <div className="pitch-key">
        <span>
          <i className="home-dot" /> Solace FC
        </span>
        <span>
          <i className="away-dot" /> Union 04
        </span>
        <span className="ball-key">
          <i /> Ball
        </span>
      </div>
      <div className="stage-actions">
        <button
          type="button"
          className="icon-button"
          aria-label="Download pitch image"
          title="Download the current pitch image"
          onClick={onImage}
        >
          <Download size={16} />
        </button>
        <button
          type="button"
          className="icon-button"
          aria-label="Open focus view"
          title="Open focus view"
          onClick={onFocus}
        >
          <Expand size={16} />
        </button>
      </div>
      <div className="renderer-choice" role="group" aria-label="Pitch renderer">
        <button
          className={!isFlat ? 'active' : ''}
          aria-pressed={!isFlat}
          onClick={() => {
            setRequested('3d');
            if (status === 'fallback') setAttempt((n) => n + 1);
          }}
        >
          <Box size={13} />
          3D
        </button>
        <button
          className={status === '2d' || status === 'fallback' ? 'active' : ''}
          aria-pressed={isFlat}
          onClick={() => setRequested('2d')}
        >
          <ScanLine size={13} />
          2D
        </button>
      </div>
      <div className="stage-hint">
        {status === '3d' && view.camera === 'orbit' ? (
          <>
            <Rotate3D size={14} /> Drag to orbit · scroll to explore
          </>
        ) : status === 'fallback' ? (
          <>
            <ScanLine size={14} /> 3D is unavailable in this browser. The tactical view is ready.{' '}
            <button onClick={() => setAttempt((n) => n + 1)}>
              Retry <ArrowUpRight size={12} />
            </button>
          </>
        ) : status === '3d' ? (
          <>Select a player. See the whole picture.</>
        ) : status === '2d' ? (
          <>Select a shirt number to follow a player.</>
        ) : (
          <>The game is taking shape.</>
        )}
      </div>
    </div>
  );
});
export default Stage;
