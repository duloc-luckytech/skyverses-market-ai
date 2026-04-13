/**
 * SKYVERSES — Upload Background Poller
 *
 * Shared utility for polling `GET /upload-media/detail?id=<jobId>` after an
 * image upload until `mediaId` and `projectId` are available (status = "done").
 *
 * Two modes:
 *
 * 1. **Fire-and-forget** (`startBackgroundUploadPoll`) — non-blocking.
 *    Use after upload in ImageLibraryModal / ProductImage workspace when you
 *    don't need to block on the result (e.g., just refresh the list after done).
 *
 * 2. **Awaitable** (`waitForUploadPoll`) — async/await.
 *    Use when you need mediaId/projectId BEFORE proceeding (e.g., applyCrop,
 *    applyDraw where the edit-image API requires mediaId to be ready first).
 *
 * Both use the same poll interval (3s) and timeout (2 min) by default.
 */

import { mediaApi } from '../apis/media';

// ─── Config ───────────────────────────────────────────────────────────────────

const POLL_INTERVAL_MS = 3_000;   // 3s between polls
const POLL_TIMEOUT_MS  = 120_000; // max 2 minutes

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UploadPollResult {
  mediaId: string;
  projectId?: string | null;
  imageUrl?: string;
}

export interface StartBackgroundUploadPollOptions {
  jobId: string;
  onDone: (result: UploadPollResult) => void;
  onError?: (msg: string) => void;
  /** Override poll interval (ms). Default: 3000 */
  intervalMs?: number;
  /** Override timeout (ms). Default: 120_000 */
  timeoutMs?: number;
}

export interface WaitForUploadPollOptions {
  jobId: string;
  /** Called on every pending tick — use to update a status message */
  onTick?: (tickCount: number) => void;
  /** Override poll interval (ms). Default: 3000 */
  intervalMs?: number;
  /** Override timeout (ms). Default: 120_000 */
  timeoutMs?: number;
}

// ─── Internal shared poll loop ────────────────────────────────────────────────

function scheduleNext(
  jobId: string,
  deadline: number,
  intervalMs: number,
  onDone: (result: UploadPollResult) => void,
  onError: (msg: string) => void,
  tickCount: { value: number },
  onTick?: (count: number) => void,
): void {
  setTimeout(async () => {
    if (Date.now() >= deadline) {
      onError('Upload polling timeout');
      return;
    }

    tickCount.value += 1;
    onTick?.(tickCount.value);

    try {
      const res = await mediaApi.getMediaById(jobId);

      if (res.success && res.status === 'done' && res.mediaId) {
        onDone({
          mediaId: res.mediaId,
          projectId: res.projectId,
          imageUrl: res.imageUrl,
        });
        return;
      }

      if (res.status === 'failed' || res.status === 'error') {
        onError('Upload job failed on server');
        return;
      }

      // Still pending/processing — schedule next poll
      scheduleNext(jobId, deadline, intervalMs, onDone, onError, tickCount, onTick);
    } catch {
      // Network error — retry silently
      scheduleNext(jobId, deadline, intervalMs, onDone, onError, tickCount, onTick);
    }
  }, intervalMs);
}

// ─── 1. Fire-and-forget (non-blocking) ────────────────────────────────────────

/**
 * Start a background poll for a given upload jobId.
 * Returns immediately — results arrive via callbacks.
 *
 * Ideal for: ImageLibraryModal upload flow, ProductImage simple upload.
 *
 * @example
 * startBackgroundUploadPoll({
 *   jobId: asset.jobId!,
 *   onDone: ({ mediaId, projectId }) => fetchMedia(1),
 *   onError: (msg) => console.warn('Poll failed:', msg),
 * });
 */
export function startBackgroundUploadPoll(options: StartBackgroundUploadPollOptions): void {
  const {
    jobId,
    onDone,
    onError = (msg) => console.warn('[uploadPoller]', msg),
    intervalMs = POLL_INTERVAL_MS,
    timeoutMs = POLL_TIMEOUT_MS,
  } = options;

  const deadline = Date.now() + timeoutMs;
  const tickCount = { value: 0 };
  scheduleNext(jobId, deadline, intervalMs, onDone, onError, tickCount);
}

// ─── 2. Awaitable (blocking) ──────────────────────────────────────────────────

/**
 * Await a background poll for a given upload jobId.
 * Resolves with `{ mediaId, projectId, imageUrl }` when done.
 * Throws on error or timeout.
 *
 * Ideal for: applyCrop / applyDraw in useProductImageEditor — where the
 * edit-image API call requires mediaId to exist before proceeding.
 *
 * @example
 * const { mediaId, projectId } = await waitForUploadPoll({
 *   jobId: uploadRes.jobId!,
 *   onTick: (n) => setStatus(`⏳ Đang chờ xử lý ảnh... (${n * 3}s)`),
 * });
 */
export function waitForUploadPoll(options: WaitForUploadPollOptions): Promise<UploadPollResult> {
  const {
    jobId,
    onTick,
    intervalMs = POLL_INTERVAL_MS,
    timeoutMs = POLL_TIMEOUT_MS,
  } = options;

  return new Promise<UploadPollResult>((resolve, reject) => {
    const deadline = Date.now() + timeoutMs;
    const tickCount = { value: 0 };
    scheduleNext(jobId, deadline, intervalMs, resolve, reject, tickCount, onTick);
  });
}
