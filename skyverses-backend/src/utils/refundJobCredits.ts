import User from "../models/UserModel";
import CreditTransaction from "../models/CreditTransaction.model";

/**
 * Refund credits for a failed/errored job.
 * Works for both ImageJob and VideoJob.
 * 
 * @param job - The job document (must have userId, creditsUsed, _id)
 * @param source - e.g. "image_error", "video_error"
 * @returns refunded amount (0 if nothing to refund)
 */
export async function refundJobCredits(
  job: { userId: any; creditsUsed?: number; _id: any },
  source: string
): Promise<number> {
  if (!job.creditsUsed || job.creditsUsed <= 0) return 0;

  const user = await User.findById(job.userId);
  if (!user) return 0;

  user.creditBalance += job.creditsUsed;
  await user.save();

  await CreditTransaction.create({
    userId: user._id,
    type: "REFUND",
    amount: job.creditsUsed,
    balanceAfter: user.creditBalance,
    source,
    note: `Auto-refund failed job: ${job._id}`,
  });

  console.log(`💳 [AUTO-REFUND] ${user.email} +${job.creditsUsed} CR (${source}: ${job._id})`);
  return job.creditsUsed;
}
