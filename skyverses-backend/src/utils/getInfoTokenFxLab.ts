import ProviderToken from "../models/ProviderToken.model";

export async function getInfoTokenFxLab(provider = "labs") {
  const [token] = await ProviderToken.aggregate([
    {
      $match: {
        provider,
        isActive: true,
        accessToken: { $exists: true, $ne: "" },
      },
    },
    { $sample: { size: 1 } }, // ⭐ random 1 token
  ]);

  if (!token) {
    throw new Error("FXLAB_NO_ACTIVE_TOKEN");
  }

  return token;
}
