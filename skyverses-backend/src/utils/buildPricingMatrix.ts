export function buildPricingMatrix({
    baseCredits,
    defaultDuration,
    perSecond,
    resolutions,
    durations,
    priceMultiplier = 5,
  }: {
    baseCredits: number;
    defaultDuration: number;   // mốc 1x (vd: 5s)
    perSecond: number;
    resolutions: Record<string, number>; // 720p:1 | 1080p:1.5
    durations: number[];
    priceMultiplier?: number;
  }) {
    const basePricing: any = {};
    const pricing: any = {};
  
    for (const [resolution, multiplier] of Object.entries(resolutions)) {
      basePricing[resolution] = {};
      pricing[resolution] = {};
  
      for (const sec of durations) {
        let credits = baseCredits;
  
        if (sec > defaultDuration) {
          credits += (sec - defaultDuration) * perSecond;
        }
  
        credits *= multiplier;
        const baseCreditsValue = Math.ceil(credits);
        basePricing[resolution][String(sec)] = baseCreditsValue;
        pricing[resolution][String(sec)] = Math.ceil(baseCreditsValue * priceMultiplier);
      }
    }
  
    return { basePricing, pricing };
  }