import { adminAuth } from "@/lib/firebase-admin";

function getAllowedSuperAdminUids() {
  return (process.env.SUPER_ADMIN_UIDS || process.env.SUPER_ADMIN_UID || "")
    .split(",")
    .map((u) => u.trim())
    .filter(Boolean);
}

export function isSuperAdminUid(uid) {
  const allowedUids = getAllowedSuperAdminUids();
  return allowedUids.includes(uid);
}

export async function verifySuperAdmin(sessionCookie) {
  if (!sessionCookie) return { ok: false, reason: "no_token" };

  try {
    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
    const uid = decoded.uid;

    if (!isSuperAdminUid(uid)) {
      return { ok: false, reason: "not_superadmin", uid };
    }

    return { ok: true, uid };
  } catch (e) {
    return { ok: false, reason: "invalid_token" };
  }
}