import 'fake-indexeddb/auto';
import { describe, expect, it } from 'vitest';
import { openViews } from './views';
import { defaultView } from '../domain/match';
import { createId } from '../domain/id';
import type { SavedView } from '../domain/views';

const makeView = (title = 'The passing lane'): SavedView => ({
  id: createId(),
  title,
  note: 'Watch the run.',
  createdAt: new Date().toISOString(),
  view: structuredClone(defaultView),
});
describe('saved-perspective persistence', () => {
  it('preserves a view and observation after reopening the database', async () => {
    const name = createId(),
      record = makeView();
    const first = await openViews(name);
    await first.save(record);
    first.close();
    const second = await openViews(name);
    expect(await second.list()).toEqual([record]);
    second.close();
  });
  it('edits one record without duplicating it, then removes only that record', async () => {
    const db = await openViews(createId()),
      a = makeView('First view'),
      b = makeView('Second view');
    await db.save(a);
    await db.save(b);
    await db.save({ ...a, title: 'A better title', note: 'A new observation.' });
    expect(await db.list()).toHaveLength(2);
    expect((await db.list()).find((record) => record.id === a.id)!.note).toBe('A new observation.');
    await db.remove(a.id);
    expect(await db.list()).toEqual([b]);
    db.close();
  });
  it('retains both views when independent tabs save at the same time', async () => {
    const name = createId(),
      a = await openViews(name),
      b = await openViews(name);
    await Promise.all([a.save(makeView('Tab one')), b.save(makeView('Tab two'))]);
    expect((await a.list()).map((record) => record.title).sort()).toEqual(['Tab one', 'Tab two']);
    a.close();
    b.close();
  });
  it('rejects invalid values before writing and preserves existing data', async () => {
    const db = await openViews(createId()),
      record = makeView();
    await db.save(record);
    await expect(
      db.save({ ...record, view: { ...record.view, timeMs: 999999 } }),
    ).rejects.toThrow();
    expect(await db.list()).toEqual([record]);
    db.close();
  });
  it('reports malformed saved data without clearing or replacing the record', async () => {
    const name = createId(),
      db = await openViews(name);
    const raw = await new Promise<IDBDatabase>((resolve) => {
      const request = indexedDB.open(name);
      request.onsuccess = () => resolve(request.result);
    });
    await new Promise<void>((resolve) => {
      const tx = raw.transaction('views', 'readwrite');
      tx.objectStore('views').put({ id: 'broken', title: 'Retain these bytes' });
      tx.oncomplete = () => resolve();
    });
    await expect(db.list()).rejects.toThrow('retained');
    const value = await new Promise<unknown>((resolve) => {
      const request = raw.transaction('views').objectStore('views').get('broken');
      request.onsuccess = () => resolve(request.result);
    });
    expect(value).toEqual({ id: 'broken', title: 'Retain these bytes' });
    db.close();
    raw.close();
  });
});
