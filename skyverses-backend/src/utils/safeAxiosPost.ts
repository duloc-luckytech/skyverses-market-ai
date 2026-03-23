import axios from "axios";

/**
 * 🧩 safeAxiosPost - gọi đúng 1 lần, không retry
 */
export async function safeAxiosPost(url: string, data: any, options: any = {}) {
  try {
    return await axios.post(url, data, options);
  } catch (err) {
    throw err;
  }
}