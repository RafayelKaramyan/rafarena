import { describe, expect, it } from 'vitest';
import { advanceTime, clockLabel, evaluateFrame, moments, players } from './match';

describe('authored replay evaluation', () => {
  it.each(moments)('evaluates $id identically after forward and reverse seeks', (moment) => {
    const expected = evaluateFrame(moment, 3100);
    evaluateFrame(moment, moment.durationMs);
    evaluateFrame(moment, 0);
    expect(evaluateFrame(moment, 3100)).toEqual(expected);
    expect(expected.positions).toHaveLength(22);
    expect(new Set(expected.positions.map((player) => player.id)).size).toBe(22);
  });
  it.each(moments)('hits every authored ball key in $id, including its final frame', (moment) => {
    for (const key of moment.ball) {
      const frame = evaluateFrame(moment, key.at);
      expect(frame.ball.x).toBeCloseTo(key.x);
      expect(frame.ball.z).toBeCloseTo(key.z);
      expect(frame.ball.y).toBeCloseTo(key.height);
    }
  });
  it('clamps invalid seeks and keeps the final ball event selected', () => {
    const moment = moments[0]!;
    expect(evaluateFrame(moment, -500).timeMs).toBe(0);
    expect(evaluateFrame(moment, Number.NaN).timeMs).toBe(0);
    expect(evaluateFrame(moment, 50000).timeMs).toBe(moment.durationMs);
    expect(evaluateFrame(moment, moment.durationMs).ball.x).toBe(52);
    expect(evaluateFrame(moment, moment.durationMs).event).toBe('The finish');
  });
  it('keeps every player in the authored pitch bounds throughout the sequences', () => {
    for (const moment of moments)
      for (let time = 0; time <= moment.durationMs; time += 100)
        for (const player of evaluateFrame(moment, time).positions) {
          expect(Math.abs(player.x)).toBeLessThanOrEqual(52.5);
          expect(Math.abs(player.z)).toBeLessThanOrEqual(34);
        }
    expect(players.filter((p) => p.team === 'home')).toHaveLength(11);
    expect(players.filter((p) => p.team === 'away')).toHaveLength(11);
  });
  it('shows a clock derived from match time and the absolute seek', () => {
    expect(clockLabel(moments[0]!, 3600)).toBe('67:27');
    expect(clockLabel(moments[0]!, -100)).toBe('67:24');
  });
  it('preserves overshoot while looping and stops exactly at the end otherwise', () => {
    expect(advanceTime(9970, 30, 10000, 2, true)).toEqual({ timeMs: 30, ended: false });
    expect(advanceTime(9970, 30, 10000, 2, false)).toEqual({ timeMs: 10000, ended: true });
    expect(advanceTime(0, 5000, 10000, 1, true).timeMs).toBe(100);
    expect(advanceTime(300, -100, 10000, 1, false).timeMs).toBe(300);
  });
});
