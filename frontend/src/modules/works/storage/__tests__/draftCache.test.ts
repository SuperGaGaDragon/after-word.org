import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  clearCachedDraft,
  cleanupDraftCache,
  getCachedDraft,
  setCachedDraft
} from '../draftCache';

function createStorage(): Storage {
  const map = new Map<string, string>();

  return {
    get length() {
      return map.size;
    },
    clear() {
      map.clear();
    },
    getItem(key: string) {
      return map.get(key) ?? null;
    },
    key(index: number) {
      return Array.from(map.keys())[index] ?? null;
    },
    removeItem(key: string) {
      map.delete(key);
    },
    setItem(key: string, value: string) {
      map.set(key, value);
    }
  };
}

describe('draftCache', () => {
  beforeEach(() => {
    vi.useRealTimers();
    Object.defineProperty(globalThis, 'localStorage', {
      value: createStorage(),
      configurable: true
    });
  });

  it('stores and retrieves a draft', () => {
    setCachedDraft('work-1', 'hello world');
    const draft = getCachedDraft('work-1');

    expect(draft?.content).toBe('hello world');
  });

  it('removes a draft by key', () => {
    setCachedDraft('work-2', 'text');
    clearCachedDraft('work-2');

    expect(getCachedDraft('work-2')).toBeNull();
  });

  it('cleans expired entries', () => {
    vi.useFakeTimers();
    setCachedDraft('work-3', 'old');

    vi.setSystemTime(Date.now() + 8 * 24 * 60 * 60 * 1000);
    cleanupDraftCache();

    expect(getCachedDraft('work-3')).toBeNull();
  });
});
