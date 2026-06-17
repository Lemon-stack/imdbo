import { headers } from "next/headers";
import crypto from "crypto";

export async function getClientIp(): Promise<string> {
  const headersList = await headers();

  const xForwardedFor = headersList.get("x-forwarded-for");
  const xRealIp = headersList.get("x-real-ip");
  const userAgent = headersList.get("user-agent");

  let ip = xForwardedFor?.split(",")[0]?.trim() || xRealIp?.trim();

  if (!ip || ip === "::1" || ip === "127.0.0.1" || ip === "0.0.0.0") {
    if (userAgent) {
      const hash = crypto
        .createHash("sha256")
        .update(userAgent)
        .digest("hex")
        .substring(0, 12);
      ip = `dev-${hash}`;
    } else {
      ip = "dev-unknown";
    }
  }

  return ip;
}
