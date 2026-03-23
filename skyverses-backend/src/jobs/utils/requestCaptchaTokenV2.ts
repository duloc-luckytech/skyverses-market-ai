import axios from "axios";

const BASE_URL = "http://127.0.0.1:3124";
const API_KEY =
  "cap_f871a3bbb976a4530a4c2c3cb6341078587e9fa7e328191ba85134631828b8ac";

const sleep = (ms: number) =>
  new Promise((r) => setTimeout(r, ms + Math.random() * 300));

export async function getCaptchaToken2({ action = "VIDEO", jobId }: { action?: string; jobId: any }) {
  const intervalMs = 3000;
  const timeoutMs = 5 * 60 * 1000;
  console.log('{ action = "VIDEO", jobId }..', { action, jobId });
  // 1️⃣ create job
  const create = await axios
    .post(
      `${BASE_URL}/captcha/request`,
      { action, apiKey: API_KEY, jobIdFxLab: jobId?.toString() },
      { timeout: 60_000 }
    )
    .catch((err) => {
      const status = err?.response?.status;
      console.log('/captcha/request err>>>', err?.response?.status)
      if (status === 401) throw new Error("CAPTCHA_INVALID_API_KEY");
      if (status === 402) throw new Error("CAPTCHA_INSUFFICIENT_CREDIT");
      if (status === 429) throw new Error("CAPTCHA_TOO_MANY_JOBS");
      throw err;
    });

  const jobIdCaptcha = create.data?.jobId;
  if (!jobIdCaptcha) throw new Error("CAPTCHA_CREATE_FAILED");

  // 2️⃣ poll result
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    const res = await axios.get(`${BASE_URL}/captcha/result/${jobIdCaptcha}`, {
      timeout: 10_000,
    });
    console.log('captcha/result}..',jobIdCaptcha);


    if (res.data.status === "READY") {
      return {
        captchaToken: res.data.captchaToken,
        sessionId: res.data.sessionId,
      };
    }

    if (res.data.status === "FAILED") {
      throw new Error(`CAPTCHA_FAILED: ${res.data.reason}`);
    }

    await sleep(intervalMs);
  }

  throw new Error("CAPTCHA_TIMEOUT");
}
