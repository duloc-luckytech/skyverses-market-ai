export function calculateCredits({
    config,
    duration = 0,
    resolution,
    images = 0,
    scenes = 0,
  }: {
    config: any;
    duration?: number;
    resolution?: string;
    images?: number;
    scenes?: number;
  }) {
    let credits = config.baseCredits || 0;
  
    if (config.rules?.perSecond && duration > 0) {
      credits += duration * config.rules.perSecond;
    }
  
    if (config.rules?.perImage && images > 0) {
      credits += images * config.rules.perImage;
    }
  
    if (config.rules?.perScene && scenes > 0) {
      credits += scenes * config.rules.perScene;
    }
  
    if (
      resolution &&
      config.rules?.resolutionMultiplier?.[resolution]
    ) {
      credits *= config.rules.resolutionMultiplier[resolution];
    }
  
    return Math.ceil(credits);
  }