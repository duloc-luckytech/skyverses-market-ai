import { useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

export type FeatureKey =
  | 'export_edl'
  | 'export_xml'
  | 'export_animatic'
  | 'share_link'
  | 'batch_export'
  | 'unlimited_scenes'
  | 'watermark_free'
  | 'priority_render';

const PRO_FEATURES: FeatureKey[] = [
  'export_edl',
  'export_xml',
  'export_animatic',
  'share_link',
  'batch_export',
  'unlimited_scenes',
  'watermark_free',
  'priority_render',
];

const FREE_SCENE_LIMIT = 10;

/**
 * Hook kiểm tra quyền truy cập feature theo tier.
 * Trả về `canAccess`, `requirePro` (mở upgrade modal), và `isUpgradeOpen`.
 */
export const useFeatureAccess = () => {
  const { user, isAuthenticated } = useAuth();
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);

  const isPro = user?.tier === 'pro' || user?.tier === 'enterprise';

  const canAccess = useCallback(
    (feature: FeatureKey): boolean => {
      if (!isAuthenticated) return false;
      if (isPro) return true;
      return !PRO_FEATURES.includes(feature);
    },
    [isAuthenticated, isPro]
  );

  const requirePro = useCallback(
    (feature: FeatureKey, onGranted?: () => void): boolean => {
      if (canAccess(feature)) {
        onGranted?.();
        return true;
      }
      setIsUpgradeOpen(true);
      return false;
    },
    [canAccess]
  );

  const closeUpgrade = useCallback(() => setIsUpgradeOpen(false), []);

  const scenesRemaining = isPro ? Infinity : Math.max(0, FREE_SCENE_LIMIT);

  return {
    isPro,
    canAccess,
    requirePro,
    isUpgradeOpen,
    closeUpgrade,
    FREE_SCENE_LIMIT,
    scenesRemaining,
  };
};
