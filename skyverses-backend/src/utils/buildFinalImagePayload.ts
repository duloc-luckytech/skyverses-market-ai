import { ImageEngineProvider, ImageJobType } from "../models/ImageJob";

export function mapFxlabAspectRatio(aspectRatio?: string) {
  if (!aspectRatio) {
    return "IMAGE_ASPECT_RATIO_LANDSCAPE"; // default an toàn
  }

  const portraitRatios = ["9:16", "3:4"];
  const landscapeRatios = ["16:9", "1:1", "4:3"];

  if (portraitRatios.includes(aspectRatio)) {
    return "IMAGE_ASPECT_RATIO_PORTRAIT";
  }

  if (landscapeRatios.includes(aspectRatio)) {
    return "IMAGE_ASPECT_RATIO_LANDSCAPE";
  }

  // fallback (tránh crash khi user nhập bậy)
  return "IMAGE_ASPECT_RATIO_LANDSCAPE";
}

const buildFxlabPayload = ({ config, input, engine }: { config: any; input: any; engine: any }) => {
  return {
    imageAspectRatio: mapFxlabAspectRatio(config.aspectRatio),
    imageModelName: engine.model,
    imageInputs: Array.isArray(input.images)
      ? input.images.map((url: any) => ({
        imageInputType: "IMAGE_INPUT_TYPE_REFERENCE",
        name: url,
      }))
      : [],
    prompt: input.prompt,
    seed: 38653,
  };
};

export function buildFinalImagePayload({
  input,
  config,
  engine,
}: {
  input: any;
  config: any;
  engine: {
    provider: ImageEngineProvider;
    model: string;
    version?: string;
  };
}) {
  switch (engine.provider) {
    case ImageEngineProvider.FXLAB:
      return buildFxlabPayload({ input, engine, config });
    default:
      // Gommo, Running, etc. — passthrough (engine handles its own payload)
      return { input, config, engine: engine.provider };
  }
}
