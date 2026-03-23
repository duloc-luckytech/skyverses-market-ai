import path from "path";
import { GoogleAuth } from "google-auth-library";

export async function getAuthToken() {
  const auth = new GoogleAuth({
    keyFile: path.resolve(__dirname, "../../../gcp-key.json"),
    scopes: ["https://www.googleapis.com/auth/cloud-platform"],
  });

  const client = await auth.getClient();
  const tokenObj = await client.getAccessToken();
  const token = typeof tokenObj === "string" ? tokenObj : tokenObj?.token || "";
  return token;
}