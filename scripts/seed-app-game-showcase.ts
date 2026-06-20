/**
 * Seed App & Game Showcase products into MarketItem API.
 *
 * Usage:
 *   SKYVERSES_MARKET_TOKEN=... npx ts-node scripts/seed-app-game-showcase.ts --dry-run
 *   SKYVERSES_MARKET_TOKEN=... npx ts-node scripts/seed-app-game-showcase.ts
 *
 * Optional:
 *   SKYVERSES_API_BASE=https://api.skyverses.com
 */

import { APP_GAME_SHOWCASE_MARKET_SEED } from '../src/constants/app-game-showcase';

const API_BASE = process.env.SKYVERSES_API_BASE || 'https://api.skyverses.com';
const TOKEN = process.env.SKYVERSES_MARKET_TOKEN || '';
const dryRun = process.argv.includes('--dry-run');

type MarketLookupResponse = {
  data?: {
    _id?: string;
    slug?: string;
  };
  message?: string;
};

type MarketMutationResponse = {
  success?: boolean;
  data?: {
    _id?: string;
    slug?: string;
  };
  message?: string;
};

const requestJson = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}),
      ...(init?.headers || {}),
    },
  });

  const data = (await response.json().catch(() => ({}))) as T;
  if (!response.ok) {
    throw new Error(`${init?.method || 'GET'} ${path} failed ${response.status}: ${JSON.stringify(data)}`);
  }
  return data;
};

const findBySlug = async (slug: string) => {
  try {
    const result = await requestJson<MarketLookupResponse>(`/market/${slug}`);
    return result.data?._id || null;
  } catch {
    return null;
  }
};

const main = async () => {
  console.log(`[seed-app-game-showcase] ${APP_GAME_SHOWCASE_MARKET_SEED.length} products`);
  console.log(`[seed-app-game-showcase] API_BASE=${API_BASE}`);
  console.log(`[seed-app-game-showcase] dryRun=${dryRun}`);

  if (!dryRun && !TOKEN) {
    throw new Error('Missing SKYVERSES_MARKET_TOKEN. Re-run with --dry-run or provide token.');
  }

  for (const product of APP_GAME_SHOWCASE_MARKET_SEED) {
    if (dryRun) {
      console.log(`[dry-run] upsert ${product.slug}`);
      continue;
    }

    const existingId = await findBySlug(product.slug);
    const method = existingId ? 'PUT' : 'POST';
    const path = existingId ? `/market/${existingId}` : '/market';

    const result = await requestJson<MarketMutationResponse>(path, {
      method,
      body: JSON.stringify(product),
    });

    console.log(`[ok] ${method} ${result.data?.slug || product.slug}`);
  }
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
