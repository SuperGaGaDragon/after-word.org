type CachedDraft = {
  content: string;
  timestamp: number;
  expiresAt: number;
  lastAccess: number;
};

type DraftCacheMap = Record<string, CachedDraft>;

const DRAFT_CACHE_KEY = 'work_drafts_v1';
const MAX_DRAFTS = 10;
const DRAFT_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function readRawCache(): DraftCacheMap {
  const raw = localStorage.getItem(DRAFT_CACHE_KEY);
  if (!raw) {
    return {};
  }

  try {
    const parsed = JSON.parse(raw) as DraftCacheMap;
    return parsed ?? {};
  } catch {
    return {};
  }
}

function writeRawCache(cache: DraftCacheMap): void {
  localStorage.setItem(DRAFT_CACHE_KEY, JSON.stringify(cache));
}

export function cleanupDraftCache(): void {
  const now = Date.now();
  const cache = readRawCache();

  const validEntries = Object.entries(cache).filter(([, draft]) => draft.expiresAt > now);
  validEntries.sort((a, b) => b[1].lastAccess - a[1].lastAccess);

  const trimmed = validEntries.slice(0, MAX_DRAFTS);
  const next: DraftCacheMap = Object.fromEntries(trimmed);
  writeRawCache(next);
}

export function getCachedDraft(workId: string): CachedDraft | null {
  cleanupDraftCache();
  const cache = readRawCache();
  const draft = cache[workId];
  if (!draft) {
    return null;
  }

  draft.lastAccess = Date.now();
  cache[workId] = draft;
  writeRawCache(cache);

  return draft;
}

export function setCachedDraft(workId: string, content: string): void {
  cleanupDraftCache();
  const now = Date.now();
  const cache = readRawCache();

  cache[workId] = {
    content,
    timestamp: now,
    expiresAt: now + DRAFT_TTL_MS,
    lastAccess: now
  };

  writeRawCache(cache);
}

export function clearCachedDraft(workId: string): void {
  const cache = readRawCache();
  if (!cache[workId]) {
    return;
  }

  delete cache[workId];
  writeRawCache(cache);
}
