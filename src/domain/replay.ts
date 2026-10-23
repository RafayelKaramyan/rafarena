import { advanceTime } from './match';

export type ReplaySnapshot = { timeMs: number; playing: boolean; speed: number; loop: boolean };
export class Replay {
  private state: ReplaySnapshot = { timeMs: 3600, playing: false, speed: 1, loop: true };
  private listeners = new Set<() => void>();
  private frames = new Set<(timeMs: number) => void>();
  private raf = 0;
  private previous = 0;
  private lastNotice = 0;
  private duration = 10000;
  snapshot = () => this.state;
  subscribe = (fn: () => void) => {
    this.listeners.add(fn);
    return () => {
      this.listeners.delete(fn);
    };
  };
  onFrame = (fn: (timeMs: number) => void) => {
    this.frames.add(fn);
    fn(this.state.timeMs);
    return () => {
      this.frames.delete(fn);
    };
  };
  private notify() {
    this.state = { ...this.state };
    this.listeners.forEach((fn) => fn());
  }
  private publishFrame() {
    this.frames.forEach((fn) => fn(this.state.timeMs));
  }
  configure(durationMs: number, timeMs: number) {
    this.pause();
    this.duration = durationMs;
    this.state.timeMs = Math.max(0, Math.min(durationMs, timeMs));
    this.publishFrame();
    this.notify();
  }
  seek(timeMs: number) {
    this.state.timeMs = Math.max(0, Math.min(this.duration, timeMs));
    this.publishFrame();
    this.notify();
  }
  setSpeed(speed: number) {
    if ([0.5, 1, 2].includes(speed)) {
      this.state.speed = speed;
      this.notify();
    }
  }
  toggleLoop() {
    this.state.loop = !this.state.loop;
    this.notify();
  }
  toggle() {
    this.state.playing ? this.pause() : this.play();
  }
  play() {
    if (this.state.playing) return;
    if (this.state.timeMs >= this.duration) this.state.timeMs = 0;
    this.state.playing = true;
    this.previous = 0;
    this.lastNotice = 0;
    this.notify();
    this.raf = requestAnimationFrame(this.tick);
  }
  pause() {
    cancelAnimationFrame(this.raf);
    this.state.playing = false;
    this.previous = 0;
    this.notify();
  }
  private tick = (now: number) => {
    if (!this.state.playing) return;
    const step = advanceTime(
      this.state.timeMs,
      this.previous ? now - this.previous : 0,
      this.duration,
      this.state.speed,
      this.state.loop,
    );
    this.previous = now;
    this.state.timeMs = step.timeMs;
    this.publishFrame();
    if (step.ended) {
      this.state.playing = false;
      this.notify();
      return;
    }
    if (now - this.lastNotice >= 50) {
      this.lastNotice = now;
      this.notify();
    }
    this.raf = requestAnimationFrame(this.tick);
  };
  destroy() {
    cancelAnimationFrame(this.raf);
    this.frames.clear();
    this.listeners.clear();
    this.state.playing = false;
  }
}
