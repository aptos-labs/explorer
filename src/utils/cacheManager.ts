/**
 * Centralized cache manager for localStorage with expiry
 * Provides utilities for cache management, size limits, and cleanup
 */

const CACHE_PREFIX = "aptos_explorer_cache_";
const MAX_CACHE_SIZE = 5 * 1024 * 1024; // 5MB limit
const CACHE_VERSION = "1.0";

interface CacheItem<T = string> {
  value: T;
  expiry: number;
  version: string;
  timestamp: number;
}

/**
 * Set an item in localStorage with expiry
 */
export function setLocalStorageWithExpiry<T = string>(
  key: string,
  value: T,
  ttl: number,
): void {
  try {
    const now = Date.now();
    const item: CacheItem<T> = {
      value,
      expiry: now + ttl,
      version: CACHE_VERSION,
      timestamp: now,
    };

    const serialized = JSON.stringify(item);
    const fullKey = `${CACHE_PREFIX}${key}`;

    // Check cache size before storing
    const currentSize = getCacheSize();
    const itemSize = new Blob([serialized]).size;

    if (currentSize + itemSize > MAX_CACHE_SIZE) {
      // Clean up expired items first
      cleanupExpiredItems();

      // If still too large, remove oldest items
      const newSize = getCacheSize();
      if (newSize + itemSize > MAX_CACHE_SIZE) {
        evictOldestItems(newSize + itemSize - MAX_CACHE_SIZE);
      }
    }

    localStorage.setItem(fullKey, serialized);
  } catch (error) {
    // Handle quota exceeded errors gracefully
    if (error instanceof DOMException && error.name === "QuotaExceededError") {
      console.warn("localStorage quota exceeded, cleaning up cache");
      cleanupExpiredItems();
      evictOldestItems(MAX_CACHE_SIZE * 0.5); // Remove 50% of cache
      try {
        localStorage.setItem(
          `${CACHE_PREFIX}${key}`,
          JSON.stringify({
            value,
            expiry: Date.now() + ttl,
            version: CACHE_VERSION,
            timestamp: Date.now(),
          }),
        );
      } catch (retryError) {
        console.error("Failed to store cache item after cleanup:", retryError);
      }
    } else {
      console.error("Error storing cache item:", error);
    }
  }
}

/**
 * Get an item from localStorage with expiry check
 * @param key - Cache key
 * @returns Cached value or null if expired/not found
 */
export function getLocalStorageWithExpiry<T = string>(key: string): T | null {
  try {
    const fullKey = `${CACHE_PREFIX}${key}`;
    const itemStr = localStorage.getItem(fullKey);

    if (!itemStr) {
      return null;
    }

    const item: CacheItem<T> = JSON.parse(itemStr);
    const now = Date.now();

    // Check if expired
    if (now > item.expiry) {
      localStorage.removeItem(fullKey);
      return null;
    }

    // Check version compatibility
    if (item.version !== CACHE_VERSION) {
      localStorage.removeItem(fullKey);
      return null;
    }

    return item.value;
  } catch (error) {
    console.error("Error reading cache item:", error);
    // Remove corrupted item
    try {
      localStorage.removeItem(`${CACHE_PREFIX}${key}`);
    } catch {
      // Ignore errors during cleanup
    }
    return null;
  }
}

/**
 * Remove an item from cache
 */
export function removeLocalStorageItem(key: string): void {
  try {
    localStorage.removeItem(`${CACHE_PREFIX}${key}`);
  } catch (error) {
    console.error("Error removing cache item:", error);
  }
}

/**
 * Get total size of cache in bytes
 */
function getCacheSize(): number {
  let totalSize = 0;
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(CACHE_PREFIX)) {
        const value = localStorage.getItem(key);
        if (value) {
          totalSize += new Blob([value]).size;
        }
      }
    }
  } catch (error) {
    console.error("Error calculating cache size:", error);
  }
  return totalSize;
}

/**
 * Clean up expired items from cache
 */
function cleanupExpiredItems(): void {
  const now = Date.now();
  const keysToRemove: string[] = [];

  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(CACHE_PREFIX)) {
        try {
          const itemStr = localStorage.getItem(key);
          if (itemStr) {
            const item: CacheItem = JSON.parse(itemStr);
            if (now > item.expiry || item.version !== CACHE_VERSION) {
              keysToRemove.push(key);
            }
          }
        } catch {
          // Corrupted item, remove it
          keysToRemove.push(key);
        }
      }
    }

    keysToRemove.forEach((key) => localStorage.removeItem(key));
  } catch (error) {
    console.error("Error cleaning up expired cache items:", error);
  }
}

/**
 * Evict oldest items until cache size is below limit
 */
function evictOldestItems(targetSize: number): void {
  const items: Array<{key: string; timestamp: number; size: number}> = [];

  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(CACHE_PREFIX)) {
        try {
          const value = localStorage.getItem(key);
          if (value) {
            const item: CacheItem = JSON.parse(value);
            items.push({
              key,
              timestamp: item.timestamp || 0,
              size: new Blob([value]).size,
            });
          }
        } catch {
          // Skip corrupted items
        }
      }
    }

    // Sort by timestamp (oldest first)
    items.sort((a, b) => a.timestamp - b.timestamp);

    // Remove items until we're under the target size
    let currentSize = getCacheSize();
    for (const item of items) {
      if (currentSize <= targetSize) {
        break;
      }
      localStorage.removeItem(item.key);
      currentSize -= item.size;
    }
  } catch (error) {
    console.error("Error evicting cache items:", error);
  }
}

/**
 * Clear all cache items
 */
export function clearCache(): void {
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(CACHE_PREFIX)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((key) => localStorage.removeItem(key));
  } catch (error) {
    console.error("Error clearing cache:", error);
  }
}

/**
 * Get cache statistics
 */
export function getCacheStats(): {
  itemCount: number;
  totalSize: number;
  maxSize: number;
} {
  let itemCount = 0;
  let totalSize = 0;

  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(CACHE_PREFIX)) {
        itemCount++;
        const value = localStorage.getItem(key);
        if (value) {
          totalSize += new Blob([value]).size;
        }
      }
    }
  } catch (error) {
    console.error("Error getting cache stats:", error);
  }

  return {
    itemCount,
    totalSize,
    maxSize: MAX_CACHE_SIZE,
  };
}
