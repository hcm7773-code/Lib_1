import { Book } from '../types';

const DOWNLOADED_IDS_KEY = 'pwa_downloaded_book_ids';
const OFFLINE_BOOK_PREFIX = 'pwa_offline_book_';

export const getDownloadedBookIds = (): string[] => {
  try {
    const saved = localStorage.getItem(DOWNLOADED_IDS_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    console.error('Failed to read downloaded book ids:', e);
    return [];
  }
};

export const isBookDownloaded = (bookId: string): boolean => {
  const ids = getDownloadedBookIds();
  return ids.includes(bookId);
};

export const saveBookForOffline = (book: Book): boolean => {
  try {
    const ids = getDownloadedBookIds();
    if (!ids.includes(book.id)) {
      ids.push(book.id);
      localStorage.setItem(DOWNLOADED_IDS_KEY, JSON.stringify(ids));
    }
    localStorage.setItem(`${OFFLINE_BOOK_PREFIX}${book.id}`, JSON.stringify(book));
    
    // Attempt to pre-fetch & cache image resources via Cache API if supported
    if ('caches' in window) {
      caches.open('children-library-v1').then((cache) => {
        if (book.coverUrl) cache.add(book.coverUrl).catch(() => {});
        book.pages.forEach((p) => {
          if (p.illustrationUrl) cache.add(p.illustrationUrl).catch(() => {});
        });
      });
    }
    return true;
  } catch (e) {
    console.error('Failed to save book for offline:', e);
    return false;
  }
};

export const removeOfflineBook = (bookId: string): boolean => {
  try {
    const ids = getDownloadedBookIds().filter((id) => id !== bookId);
    localStorage.setItem(DOWNLOADED_IDS_KEY, JSON.stringify(ids));
    localStorage.removeItem(`${OFFLINE_BOOK_PREFIX}${bookId}`);
    return true;
  } catch (e) {
    console.error('Failed to remove offline book:', e);
    return false;
  }
};

export const getOfflineBook = (bookId: string): Book | null => {
  try {
    const data = localStorage.getItem(`${OFFLINE_BOOK_PREFIX}${bookId}`);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    console.error('Failed to get offline book:', e);
    return null;
  }
};

export const getAllOfflineBooks = (): Book[] => {
  const ids = getDownloadedBookIds();
  const books: Book[] = [];
  ids.forEach((id) => {
    const b = getOfflineBook(id);
    if (b) books.push(b);
  });
  return books;
};

export const cacheRecentlyReadBook = (book: Book) => {
  // Auto-save the last 6 read books so children can always re-read offline
  saveBookForOffline(book);
};

export interface OfflineAnalytics {
  downloadedBookCount: number;
  downloadedBooks: Book[];
  totalPagesCached: number;
  totalVocabCount: number;
  estimatedBytesUsed: number;
  estimatedMB: string;
  isOnline: boolean;
  hasCacheApiSupport: boolean;
  lastSyncTime: string;
}

export const getOfflineStorageAnalytics = (): OfflineAnalytics => {
  const books = getAllOfflineBooks();
  const downloadedBookCount = books.length;
  const totalPagesCached = books.reduce((acc, b) => acc + (b.pages?.length || 0), 0);

  // Calculate local storage byte size
  let estimatedBytesUsed = 0;
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const value = localStorage.getItem(key) || '';
        estimatedBytesUsed += (key.length + value.length) * 2; // ~2 bytes per char
      }
    }
  } catch (e) {
    console.error('Error calculating storage size:', e);
  }

  const estimatedMB = (estimatedBytesUsed / (1024 * 1024)).toFixed(2);

  // Vocab count
  let totalVocabCount = 0;
  try {
    const wordbankData = localStorage.getItem('user_wordbank');
    if (wordbankData) {
      const parsed = JSON.parse(wordbankData);
      totalVocabCount = Array.isArray(parsed) ? parsed.length : 0;
    }
  } catch (e) {}

  return {
    downloadedBookCount,
    downloadedBooks: books,
    totalPagesCached,
    totalVocabCount,
    estimatedBytesUsed,
    estimatedMB: `${estimatedMB} MB`,
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    hasCacheApiSupport: typeof window !== 'undefined' && 'caches' in window,
    lastSyncTime: new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' }),
  };
};

export const clearAllOfflineStorageCache = (): boolean => {
  try {
    const ids = getDownloadedBookIds();
    ids.forEach((id) => {
      localStorage.removeItem(`${OFFLINE_BOOK_PREFIX}${id}`);
    });
    localStorage.removeItem(DOWNLOADED_IDS_KEY);
    return true;
  } catch (e) {
    return false;
  }
};

