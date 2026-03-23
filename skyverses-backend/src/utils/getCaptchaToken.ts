import CaptchaToken from "../models/CaptchaToken.model";


export async function getCaptchaToken(jobId:string) {
  const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);

  return CaptchaToken.findOneAndUpdate(
    {
      status: "pending",
      jobId: { $exists: false },
      createdAt: { $gte: twoMinutesAgo },
    },
    {
      status: "used",
      jobId,
      usedAt: new Date(),
    },
    {
      sort: { createdAt: 1 },
      new: true,
    }
  );
}
