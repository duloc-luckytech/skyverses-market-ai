export function buildPricingMatrix({
    baseCredits,
    defaultDuration,
    perSecond,
    resolutions,
    durations,
    modes,
    priceMultiplier = 5,
  }: {
    baseCredits: number;
    defaultDuration: number;   // mốc 1x (vd: 5s)
    perSecond: number;
    resolutions: Record<string, number>; // 720p:1 | 1080p:1.5
    durations: number[];
    modes?: string[];          // ["relaxed", "fast"] — for image/mode-based pricing
    priceMultiplier?: number;
  }) {
    const basePricing: any = {};
    const pricing: any = {};

    // Determine pricing keys: use durations if available, otherwise use modes
    const isModeBased = durations.length === 0 && modes && modes.length > 0;
    const pricingKeys: (string | number)[] = isModeBased ? modes! : durations;

    for (const [resolution, multiplier] of Object.entries(resolutions)) {
      basePricing[resolution] = {};
      pricing[resolution] = {};

      for (const key of pricingKeys) {
        let credits = baseCredits;

        if (!isModeBased) {
          // Duration-based: add per-second cost for longer durations
          const sec = Number(key);
          if (sec > defaultDuration) {
            credits += (sec - defaultDuration) * perSecond;
          }
        }

        credits *= multiplier;
        const baseCreditsValue = Math.ceil(credits);
        basePricing[resolution][String(key)] = baseCreditsValue;
        pricing[resolution][String(key)] = Math.ceil(baseCreditsValue * priceMultiplier);
      }
    }

    return { basePricing, pricing };
  }