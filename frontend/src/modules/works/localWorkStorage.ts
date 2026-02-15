/**
 * Local work storage for unauthenticated users
 */

export interface LocalWork {
  workId: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = 'afterword_local_works';

function getWorks(): LocalWork[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveWorks(works: LocalWork[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(works));
  } catch (error) {
    console.error('Failed to save local works:', error);
  }
}

export function createLocalWork(): LocalWork {
  const now = new Date().toISOString();
  const workId = `local_${Date.now()}`;

  const newWork: LocalWork = {
    workId,
    title: 'Untitled Work',
    content: '',
    createdAt: now,
    updatedAt: now,
  };

  const works = getWorks();
  works.unshift(newWork);
  saveWorks(works);

  return newWork;
}

export function getLocalWork(workId: string): LocalWork | null {
  const works = getWorks();
  return works.find(w => w.workId === workId) ?? null;
}

export function updateLocalWork(workId: string, updates: Partial<Pick<LocalWork, 'title' | 'content'>>): void {
  const works = getWorks();
  const index = works.findIndex(w => w.workId === workId);

  if (index !== -1) {
    const work = works[index];
    if (work) {
      if (updates.title !== undefined) {
        work.title = updates.title;
      }
      if (updates.content !== undefined) {
        work.content = updates.content;
      }
      work.updatedAt = new Date().toISOString();
      saveWorks(works);
    }
  }
}
