// services/resendEmail.ts
import { Resend } from "resend";
import { EmailLogModel } from "../../models/EmailModel";

const resend = new Resend(process.env.RESEND_API_KEY || "");

export async function sendEmailResend({
  to,
  subject,
  html,
  userId,
  templateName,
  type,
  meta = {},
}: any) {
  try {
    console.log("start send email");

    const result: any = await resend.emails.send({
      from: process.env.RESEND_FROM || "",
      to,
      subject,
      html,
    });

    await EmailLogModel.create({
      to,
      subject,
      html,
      userId,
      templateName,
      type,
      meta,
      status: "success",
    });

    return { success: true, id: result?.id };
  } catch (err: any) {
    console.error("❌ Resend email error:", err?.message);

    await EmailLogModel.create({
      to,
      subject,
      html,
      userId,
      templateName,
      type,
      meta,
      status: "failed",
      error: err?.message,
    });

    return { success: false, error: err?.message };
  }
}
