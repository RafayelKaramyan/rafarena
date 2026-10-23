import { savedViewSchema, type SavedView } from '../domain/views';

export type ViewRepository = {
  list: () => Promise<SavedView[]>;
  save: (view: SavedView) => Promise<void>;
  remove: (id: string) => Promise<void>;
  close: () => void;
};
export async function openViews(name = 'rafarena-views-v1'): Promise<ViewRepository> {
  const db = await new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(name, 1);
    request.onupgradeneeded = () => request.result.createObjectStore('views', { keyPath: 'id' });
    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(
        new Error('Browser storage is unavailable. Your current perspective is still usable.'),
      );
    request.onblocked = () =>
      reject(new Error('Close another Rafarena tab to unlock browser storage.'));
  });
  function transact<T>(
    mode: IDBTransactionMode,
    operation: (store: IDBObjectStore) => IDBRequest<T>,
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const tx = db.transaction('views', mode);
      const request = operation(tx.objectStore('views'));
      tx.oncomplete = () => resolve(request.result);
      tx.onabort = () =>
        reject(
          new Error('The browser could not save this change. Your saved views have been retained.'),
        );
      tx.onerror = () =>
        reject(
          new Error('The browser could not save this change. Your saved views have been retained.'),
        );
    });
  }
  return {
    list: async () => {
      const records = await transact<unknown[]>('readonly', (store) => store.getAll());
      const parsed = records.map((record) => savedViewSchema.safeParse(record));
      if (parsed.some((record) => !record.success))
        throw new Error(
          'A saved view cannot be read. Stored records have been retained; you can still explore and share new perspectives.',
        );
      return parsed
        .flatMap((record) => (record.success ? [record.data] : []))
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    },
    save: async (view) => {
      const valid = savedViewSchema.parse(view);
      await transact('readwrite', (store) => store.put(valid));
    },
    remove: async (id) => {
      await transact('readwrite', (store) => store.delete(id));
    },
    close: () => db.close(),
  };
}
