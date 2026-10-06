/**
 * Each term's final take — the recording that got the final verdict. Real
 * mode only.
 *
 * Two copies. In memory, for the end-of-session summary, cleared when a new
 * session starts. And in IndexedDB (which, unlike `localStorage`, holds a
 * Blob), for the review the plan opens later: it survives reloads, closing
 * the browser and dev-server restarts, and a new session does not clear it —
 * only a newer result for the same term replaces or drops it. If IndexedDB is
 * unavailable or a read fails, the review hides the player rather than draw
 * one with nothing behind it.
 */

import type { TermPosition } from './session';

export type SessionTake = { blob: Blob; seconds: number };

const takes = new Map<TermPosition, SessionTake>();

const DB_NAME = 'explain-takes';
const STORE = 'takes';

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function withStore<T>(mode: IDBTransactionMode, run: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await openDb();
  try {
    return await new Promise<T>((resolve, reject) => {
      const request = run(db.transaction(STORE, mode).objectStore(STORE));
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  } finally {
    db.close();
  }
}

export function keepTake(term: TermPosition, take: SessionTake): void {
  takes.set(term, take);
  withStore('readwrite', (store) => store.put(take, term)).catch(() => {});
}

export function readTake(term: TermPosition): SessionTake | undefined {
  return takes.get(term);
}

/** The take a review plays: this session's if there is one, else the stored one. Undefined when there is none or storage fails. */
export async function readStoredTake(term: TermPosition): Promise<SessionTake | undefined> {
  const inMemory = takes.get(term);
  if (inMemory) return inMemory;
  try {
    const stored = await withStore<SessionTake | undefined>('readonly', (store) => store.get(term));
    return stored && stored.blob instanceof Blob && stored.blob.size > 0 ? stored : undefined;
  } catch {
    return undefined;
  }
}

/** A term whose final answer had no recording — an earlier take must not play as if it were the last. */
export function dropTake(term: TermPosition): void {
  takes.delete(term);
  withStore('readwrite', (store) => store.delete(term)).catch(() => {});
}

/** A new session: this session's takes go. The stored ones stay until a newer result replaces them. */
export function clearTakes(): void {
  takes.clear();
}
