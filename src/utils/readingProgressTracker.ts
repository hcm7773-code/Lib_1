import { Book, ReadingLogEntry, UserProfile } from '../types';

export interface ActiveReadingSession {
  bookId: string;
  bookTitle: string;
  coverUrl: string;
  lastPageRead: number;
  totalPages: number;
  progressPercent: number;
  lastReadTimestamp: number;
  lastReadDateStr: string;
  completed: boolean;
}

const STORAGE_KEY_LAST_ACTIVE = 'wcdl_last_active_reading';
const STORAGE_KEY_PROGRESS_MAP = 'wcdl_all_reading_progress';
const STORAGE_KEY_DISMISSED_RESUME = 'wcdl_dismissed_resume_book_id';

/**
 * Persist current active reading progress
 */
export function recordReadingProgress(
  book: Book,
  pageNumber: number,
  isFinished: boolean = false
): ActiveReadingSession {
  const totalPages = book.pages.length;
  const progressPercent = Math.min(100, Math.max(0, Math.round((pageNumber / totalPages) * 100)));
  const now = Date.now();
  const dateStr = new Date().toLocaleDateString('zh-TW');

  const titleStr = typeof book.title === 'string'
    ? book.title
    : (book.title['zh-TW'] || book.title.en || '繪本');

  const session: ActiveReadingSession = {
    bookId: book.id,
    bookTitle: titleStr,
    coverUrl: book.coverUrl,
    lastPageRead: pageNumber,
    totalPages,
    progressPercent,
    lastReadTimestamp: now,
    lastReadDateStr: dateStr,
    completed: isFinished || (pageNumber >= totalPages),
  };

  try {
    // Save latest single active reading session
    localStorage.setItem(STORAGE_KEY_LAST_ACTIVE, JSON.stringify(session));

    // Save into progress dictionary map
    const savedMapStr = localStorage.getItem(STORAGE_KEY_PROGRESS_MAP);
    const map: Record<string, ActiveReadingSession> = savedMapStr ? JSON.parse(savedMapStr) : {};
    map[book.id] = session;
    localStorage.setItem(STORAGE_KEY_PROGRESS_MAP, JSON.stringify(map));
  } catch (err) {
    console.warn('Failed to save reading progress to localStorage', err);
  }

  return session;
}

/**
 * Get the latest active reading session from local storage
 */
export function getLastActiveReading(): ActiveReadingSession | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_LAST_ACTIVE);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (err) {
    console.warn('Failed to read last active reading', err);
  }
  return null;
}

/**
 * Get all reading progress records mapped by book ID
 */
export function getAllReadingProgressMap(): Record<string, ActiveReadingSession> {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_PROGRESS_MAP);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch {}
  return {};
}

export interface UnfinishedBookPromptData {
  book: Book;
  lastPageRead: number;
  totalPages: number;
  progressPercent: number;
  lastReadDateStr: string;
  timeSpentMinutes?: number;
}

/**
 * Checks and finds the most recent unfinished book from reading history and local progress
 */
export function findMostRecentUnfinishedBook(
  allBooks: Book[],
  userProfile?: UserProfile
): UnfinishedBookPromptData | null {
  try {
    const progressMap = getAllReadingProgressMap();
    const lastActive = getLastActiveReading();
    const history = userProfile?.readingHistory || [];

    // Candidate list
    const candidates: {
      bookId: string;
      lastPage: number;
      totalPages: number;
      percent: number;
      timestamp: number;
      dateStr: string;
      timeSpent?: number;
      completed: boolean;
    }[] = [];

    // Check last active reading session first
    if (lastActive && !lastActive.completed && lastActive.lastPageRead > 0) {
      candidates.push({
        bookId: lastActive.bookId,
        lastPage: lastActive.lastPageRead,
        totalPages: lastActive.totalPages,
        percent: lastActive.progressPercent,
        timestamp: lastActive.lastReadTimestamp || Date.now(),
        dateStr: lastActive.lastReadDateStr || new Date().toLocaleDateString('zh-TW'),
        completed: lastActive.completed,
      });
    }

    // Check progress map
    Object.values(progressMap).forEach((prog) => {
      if (!prog.completed && prog.lastPageRead > 0 && !candidates.some((c) => c.bookId === prog.bookId)) {
        candidates.push({
          bookId: prog.bookId,
          lastPage: prog.lastPageRead,
          totalPages: prog.totalPages,
          percent: prog.progressPercent,
          timestamp: prog.lastReadTimestamp || 0,
          dateStr: prog.lastReadDateStr,
          completed: prog.completed,
        });
      }
    });

    // Check user profile reading history
    history.forEach((h) => {
      if (!h.completed && h.lastPageRead > 0 && h.progressPercent < 100) {
        const existing = candidates.find((c) => c.bookId === h.bookId);
        if (!existing) {
          candidates.push({
            bookId: h.bookId,
            lastPage: h.lastPageRead,
            totalPages: h.totalPages,
            percent: h.progressPercent,
            timestamp: 0,
            dateStr: h.lastReadAt,
            timeSpent: h.timeSpentMinutes,
            completed: h.completed,
          });
        }
      }
    });

    // Sort by timestamp desc
    candidates.sort((a, b) => b.timestamp - a.timestamp);

    for (const cand of candidates) {
      if (!cand.completed) {
        const matchedBook = allBooks.find((b) => b.id === cand.bookId);
        if (matchedBook && matchedBook.pages.length > 0) {
          const validPage = Math.min(matchedBook.pages.length, Math.max(1, cand.lastPage));
          const percent = Math.round((validPage / matchedBook.pages.length) * 100);
          return {
            book: matchedBook,
            lastPageRead: validPage,
            totalPages: matchedBook.pages.length,
            progressPercent: percent,
            lastReadDateStr: cand.dateStr || '今天',
            timeSpentMinutes: cand.timeSpent,
          };
        }
      }
    }
  } catch (e) {
    console.warn('Error in findMostRecentUnfinishedBook', e);
  }

  return null;
}

/**
 * Check if the user already dismissed resume prompt for this specific book
 */
export function isResumePromptDismissedForBook(bookId: string): boolean {
  try {
    const dismissedId = sessionStorage.getItem(STORAGE_KEY_DISMISSED_RESUME);
    return dismissedId === bookId;
  } catch {
    return false;
  }
}

/**
 * Set dismissed resume prompt for current session
 */
export function dismissResumePromptForBook(bookId: string): void {
  try {
    sessionStorage.setItem(STORAGE_KEY_DISMISSED_RESUME, bookId);
  } catch {}
}
