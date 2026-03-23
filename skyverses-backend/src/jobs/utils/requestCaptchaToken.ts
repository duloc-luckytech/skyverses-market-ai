import axios from "axios";

export async function requestCaptchaToken({
  action = "VIDEO",
}: {
  action?: string;
}) {
  const res = await axios.post(
    "http://127.0.0.1:3124/captcha/request",
    {
      action,
      apiKey:
        "cap_f871a3bbb976a4530a4c2c3cb6341078587e9fa7e328191ba85134631828b8ac",
    },
    {
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 90_000, // vì BE có long-poll
    }
  );

  if (!res.data?.success || !res.data?.captchaToken) {
    const err: any = new Error("CAPTCHA_REQUEST_FAILED");
    err.raw = res.data;
    throw err;
  }

  return {
    captchaToken: res.data.captchaToken,
    sessionId: res.data.sessionId,
  };
}

export async function requestCaptchaTokenWithRetry(
  payload: { action: string },
  options?: {
    retry?: number;
    delayMs?: number;
  }
): Promise<{ captchaToken: string; sessionId: string }> {
  const retry = options?.retry ?? 5;
  const delayMs = options?.delayMs ?? 4000;

  for (let i = 0; i < retry; i++) {
    try {
      const data = await requestCaptchaToken(payload);
      return data;
    } catch (err: any) {
      console.log("requestCaptchaTokenWithRetry>>>", err);
      const code = err?.response?.data?.message || err?.response?.data?.code;

      if (code === "TOO_MANY_PENDING_JOBS") {
        console.warn(
          `[Captcha] TOO_MANY_PENDING_JOBS → retry ${i + 1}/${retry}`
        );
        await new Promise((r) => setTimeout(r, delayMs));
        continue;
      }

      if (code === "JOB_ALREADY_IN_PROGRESS") {
        console.warn("[Captcha] JOB_ALREADY_IN_PROGRESS → retry");
        await new Promise((r) => setTimeout(r, delayMs));
        continue;
      }

      // ❌ lỗi khác → throw thật
      throw err;
    }
  }

  throw new Error("CAPTCHA_RETRY_EXCEEDED");
}
