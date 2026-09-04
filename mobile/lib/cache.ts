// Cache utility – in-memory cache with TTL, plus file-based persistence for
// offline / instant cold start. Session data stays in SecureStore (see auth.tsx).

import * as FileSystem from 'expo-file-system/legacy';

interface CacheEntry<T> {
    data: T;
    timestamp: number;
    ttl: number;
}

const memoryCache = new Map<string, CacheEntry<unknown>>();

export const CACHE_TTL = {
    BOOTSTRAP: 15 * 60 * 1000,
    GALLERY: 30 * 60 * 1000,
    BOOKINGS: 2 * 60 * 1000,
    SLOTS: 60 * 1000,
} as const;

export const CACHE_KEYS = {
    BOOTSTRAP: 'bootstrap',
    GALLERY: 'gallery',
    BOOKINGS: 'bookings',
    SLOTS: 'slots',
    REVIEWS: 'reviews',
} as const;

export function getCached<T>(key: string): T | null {
    const entry = memoryCache.get(key) as CacheEntry<T> | undefined;
    if (!entry) return null;
    if (Date.now() - entry.timestamp > entry.ttl) {
        memoryCache.delete(key);
        return null;
    }
    return entry.data;
}

export function setCache<T>(key: string, data: T, ttl: number): void {
    memoryCache.set(key, { data, timestamp: Date.now(), ttl });
}

export function invalidateCache(key: string): void {
    memoryCache.delete(key);
}

/** Removes every cached availability lookup (after a booking changes). */
export function invalidateSlots(): void {
    for (const key of Array.from(memoryCache.keys())) {
        if (key.startsWith(`${CACHE_KEYS.SLOTS}_`)) memoryCache.delete(key);
    }
}

export function invalidateAll(): void {
    memoryCache.clear();
}

export function isCacheFresh(key: string): boolean {
    const entry = memoryCache.get(key);
    if (!entry) return false;
    return Date.now() - entry.timestamp <= entry.ttl;
}

// ===== Persistent cache (file system) =====

const CACHE_DIR = `${FileSystem.cacheDirectory || FileSystem.documentDirectory || ''}liat-cache/`;

async function ensureDir(): Promise<boolean> {
    try {
        const info = await FileSystem.getInfoAsync(CACHE_DIR);
        if (!info.exists) await FileSystem.makeDirectoryAsync(CACHE_DIR, { intermediates: true });
        return true;
    } catch {
        return false;
    }
}

function fileFor(key: string): string {
    return `${CACHE_DIR}${key.replace(/[^a-z0-9_-]/gi, '_')}.json`;
}

/** Best-effort, non-blocking persistence (no size limit). */
export async function persistCache<T>(key: string, data: T): Promise<void> {
    try {
        if (!(await ensureDir())) return;
        await FileSystem.writeAsStringAsync(fileFor(key), JSON.stringify({ savedAt: Date.now(), data }));
    } catch {
        // persistence is optional
    }
}

export async function loadPersistedCache<T>(key: string): Promise<T | null> {
    try {
        const path = fileFor(key);
        const info = await FileSystem.getInfoAsync(path);
        if (!info.exists) return null;
        const json = await FileSystem.readAsStringAsync(path);
        const parsed = JSON.parse(json) as { savedAt: number; data: T };
        return parsed?.data ?? null;
    } catch {
        return null;
    }
}

export async function clearPersistedCache(): Promise<void> {
    try {
        await FileSystem.deleteAsync(CACHE_DIR, { idempotent: true });
    } catch {
        // ignore
    }
}
