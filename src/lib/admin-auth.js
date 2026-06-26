import { adminAuth } from "@/lib/firebase-admin";

const SUPER_ADMIN_UIDS = (process.env.SUPER_ADMIN_UIDS || process.env.SUPER_ADMIN_UID || "")
  .split(",")
  .map((u) => u.trim())
  .filter(Boolean);

export async function verifySuperAdmin(sessionCookie) {
  if (!sessionCookie) return { ok: false, reason: "no_token" };

  try {
    // Verificar session cookie (checkRevoked: true)
    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
    const uid = decoded.uid;

    if (!SUPER_ADMIN_UIDS.includes(uid)) {
      return { ok: false, reason: "not_superadmin", uid };
    }

    return { ok: true, uid };
  } catch (e) {
    return { ok: false, reason: "invalid_token" };
  }
}