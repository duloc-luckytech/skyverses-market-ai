/**
 * useJobPoller — Shared polling core for all image/video generation jobs.
 *
 * Exports:
 *  - `useJobPoller(callbacks, config)` — React hook for single-job polling
 *    with automatic cleanup on unmount.
 *  - `pollJobOnce(options)` — plain async utility for parallel multi-job
 *    polling (useEventStudio, useStoryboardStudio).
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { imagesApi } from '../apis/images';
import { videosApi } from '../apis/videos';

// ─── Public Types ──────────────────────────────────────────────────────────────

/** Payload delivered to onDone callback */
export interface JobDoneResult {
  images?: string[];
  videoUrl?: string;
  thumbnail?: string;
}

/** Info passed to onTick so callers can simulate progress */
export interface PollTickInfo {
  /** Number of polls completed so far, starts at 1 */
  tickCount: number;
  /** Milliseconds elapsed since startPolling() was called */
  elapsedMs: number;
}

export interface JobPollerCallbacks {
  onDone: (result: JobDoneResult) => void;
  onError: (errorMsg: string) => void;
  /** Called on every pending/processing tick. Use to drive progress animations. */
  onTick?: (info: PollTickInfo) => void;
  /** Called on max-duration timeout. Falls back to onError if not provided. */
  onTimeout?: () => void;
}

export interface JobPollerConfig {
  /** 'image' uses imagesApi, 'video' uses videosApi. Default: 'image' */
  apiType?: 'image' | 'video';
  /** Milliseconds between polls. Default: 5000 */
  intervalMs?: number;
  /** Maximum total duration before timeout. Default: 180_000 (3 min) */
  maxDurationMs?: number;
  /** Retry delay after a network error. Default: 10_000 */
  networkRetryMs?: number;
}

/** Return value of useJobPoller */
export interface UseJobPollerReturn {
  /** Start polling for the given jobId. Cancels any in-flight poll first. */
  startPolling: (jobId: string) => void;
  /** Manually cancel polling (does not call onError/onDone). */
  cancel: () => void;
  /** True while actively polling. */
  isPolling: boolean;
}

// ─── PollJobOptions (for pollJobOnce utility) ─────────────────────────────────

/** Options for pollJobOnce — used when running multiple jobs in parallel */
export interface PollJobOptions extends JobPollerCallbacks {
  jobId: string;
  /** Caller-managed cancel flag; set to true to abort the running poll. */
  isCancelledRef: React.MutableRefObject<boolean>;
  apiType?: 'image' | 'video';
  intervalMs?: number;
  maxDurationMs?: number;
  networkRetryMs?: number;
}

// ─── Internal helper: parse API response ──────────────────────────────────────

function parseResponse(data: any): {
  status: string;
  result: JobDoneResult;
  errorMsg: string;
} {
  const status = (data?.status ?? '').toLowerCase();
  const result: JobDoneResult = {
    images: data?.result?.images,
    videoUrl: data?.result?.videoUrl,
    thumbnail: data?.result?.thumbnail ?? data?.result?.thumbnailUrl,
  };
  const errorMsg =
    data?.error?.userMessage ??
    data?.error?.message ??
    'Job thất bại';
  return { status, result, errorMsg };
}

// ─── Core poll loop (shared by hook and utility) ──────────────────────────────

async function runPollLoop(
  jobId: string,
  apiType: 'image' | 'video',
  intervalMs: number,
  maxDurationMs: number,
  networkRetryMs: number,
  startTime: number,
  tickCountRef: { current: number },
  cancelledRef: React.MutableRefObject<boolean>,
  callbacksRef: React.MutableRefObject<JobPollerCallbacks>,
  scheduleNext: (delayMs: number) => void,
  onFinish: () => void,
): Promise<void> {
  if (cancelledRef.current) return;

  // ─── Timeout check ──────────────────────────────────────────────────
  const elapsedMs = Date.now() - startTime;
  if (elapsedMs >= maxDurationMs) {
    onFinish();
    if (callbacksRef.current.onTimeout) {
      callbacksRef.current.onTimeout();
    } else {
      callbacksRef.current.onError('Quá thời gian xử lý. Vui lòng thử lại.');
    }
    return;
  }

  tickCountRef.current += 1;

  try {
    // ─── Fetch status ──────────────────────────────────────────────────
    const raw =
      apiType === 'video'
        ? await videosApi.getJobStatus(jobId)
        : await imagesApi.getJobStatus(jobId);

    if (cancelledRef.current) return;

    const { status, result, errorMsg } = parseResponse(raw?.data);

    if (status === 'done') {
      onFinish();
      callbacksRef.current.onDone(result);
    } else if (status === 'failed' || status === 'error') {
      onFinish();
      callbacksRef.current.onError(errorMsg);
    } else {
      // Still pending / processing — fire onTick then schedule next poll
      callbacksRef.current.onTick?.({
        tickCount: tickCountRef.current,
        elapsedMs: Date.now() - startTime,
      });
      scheduleNext(intervalMs);
    }
  } catch {
    // Network / parse error — retry later, do NOT call onError yet
    if (cancelledRef.current) return;
    scheduleNext(networkRetryMs);
  }
}

// ─── useJobPoller HOOK ────────────────────────────────────────────────────────

/**
 * React hook that manages a single image or video job poll.
 * Automatically cleans up on component unmount.
 *
 * @example
 * const poller = useJobPoller({
 *   onDone: (result) => setImageUrl(result.images?.[0] ?? null),
 *   onError: (msg) => { addCredits(cost); setError(msg); },
 *   onTick: ({ elapsedMs }) => setProgress(Math.min(95, (elapsedMs / 180_000) * 95)),
 * }, { apiType: 'image', intervalMs: 3000 });
 *
 * // In handleSubmit:
 * poller.startPolling(jobId);
 */
export function useJobPoller(
  callbacks: JobPollerCallbacks,
  config: JobPollerConfig = {},
): UseJobPollerReturn {
  const {
    apiType = 'image',
    intervalMs = 5000,
    maxDurationMs = 180_000,
    networkRetryMs = 10_000,
  } = config;

  const [isPolling, setIsPolling] = useState(false);

  // Refs — never trigger re-render
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startTimeRef = useRef<number>(0);
  const tickCountRef = useRef<number>(0);
  const cancelledRef = useRef<boolean>(false);
  const jobIdRef = useRef<string>('');

  // Always hold fresh callbacks (avoids stale closure inside setTimeout chain)
  const callbacksRef = useRef<JobPollerCallbacks>(callbacks);
  useEffect(() => {
    callbacksRef.current = callbacks;
  });

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancelledRef.current = true;
      if (timeoutRef.current !== null) clearTimeout(timeoutRef.current);
    };
  }, []);

  const onFinish = useCallback(() => {
    setIsPolling(false);
  }, []);

  const scheduleNextPoll = useCallback(
    (delayMs: number) => {
      timeoutRef.current = setTimeout(() => {
        runPollLoop(
          jobIdRef.current,
          apiType,
          intervalMs,
          maxDurationMs,
          networkRetryMs,
          startTimeRef.current,
          tickCountRef,
          cancelledRef,
          callbacksRef,
          scheduleNextPoll,
          onFinish,
        );
      }, delayMs);
    },
    [apiType, intervalMs, maxDurationMs, networkRetryMs, onFinish],
  );

  const startPolling = useCallback(
    (jobId: string) => {
      // Cancel any previous poll
      if (timeoutRef.current !== null) clearTimeout(timeoutRef.current);
      cancelledRef.current = false;
      tickCountRef.current = 0;
      jobIdRef.current = jobId;
      startTimeRef.current = Date.now();
      setIsPolling(true);

      // Start immediately (first poll with no delay)
      runPollLoop(
        jobId,
        apiType,
        intervalMs,
        maxDurationMs,
        networkRetryMs,
        startTimeRef.current,
        tickCountRef,
        cancelledRef,
        callbacksRef,
        scheduleNextPoll,
        onFinish,
      );
    },
    [apiType, intervalMs, maxDurationMs, networkRetryMs, scheduleNextPoll, onFinish],
  );

  const cancel = useCallback(() => {
    cancelledRef.current = true;
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsPolling(false);
  }, []);

  return { startPolling, cancel, isPolling };
}

// ─── pollJobOnce UTILITY ──────────────────────────────────────────────────────

/**
 * Plain async utility for polling a single job — NOT a React hook.
 * Use this when you need multiple jobs running in parallel
 * (e.g., useEventStudio, useStoryboardStudio).
 *
 * Caller is responsible for lifecycle via `isCancelledRef`.
 * Set `isCancelledRef.current = true` to abort.
 *
 * @example
 * const isCancelledRef = useRef(false);
 * // Start N jobs in parallel:
 * await Promise.all(jobIds.map(jobId =>
 *   pollJobOnce({ jobId, isCancelledRef, onDone: ..., onError: ... })
 * ));
 */
export async function pollJobOnce(options: PollJobOptions): Promise<void> {
  const {
    jobId,
    isCancelledRef,
    apiType = 'image',
    intervalMs = 5000,
    maxDurationMs = 180_000,
    networkRetryMs = 10_000,
    onDone,
    onError,
    onTick,
    onTimeout,
  } = options;

  const startTime = Date.now();
  const tickCountRef = { current: 0 };

  // Wrap callbacks in a ref-like object (already non-React, just plain object)
  const callbacksRef = {
    current: { onDone, onError, onTick, onTimeout },
  };

  return new Promise<void>((resolve) => {
    const scheduleNext = (delayMs: number) => {
      setTimeout(() => {
        runPollLoop(
          jobId,
          apiType,
          intervalMs,
          maxDurationMs,
          networkRetryMs,
          startTime,
          tickCountRef,
          isCancelledRef,
          callbacksRef,
          scheduleNext,
          resolve,
        );
      }, delayMs);
    };

    runPollLoop(
      jobId,
      apiType,
      intervalMs,
      maxDurationMs,
      networkRetryMs,
      startTime,
      tickCountRef,
      isCancelledRef,
      callbacksRef,
      scheduleNext,
      resolve,
    );
  });
}
