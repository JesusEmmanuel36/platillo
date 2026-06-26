import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { Timestamp } from "firebase-admin/firestore";
import { db } from "@/lib/firebase-admin";
import { verifySuperAdmin } from "@/lib/admin-auth";

function addDays(date, days) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

function addMonths(date, months) {
  const copy = new Date(date);
  copy.setMonth(copy.getMonth() + months);
  return copy;
}

async function verifyRequest(req) {
  const host = req.headers.get("host") || "";

  const isAdminHost =
    host === "admin.platillo.mx" || host.startsWith("localhost:");

  if (!isAdminHost) {
    return {
      ok: false,
      response: NextResponse.json(
        { ok: false, reason: "forbidden_host" },
        { status: 403 }
      ),
    };
  }

  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("admin_token")?.value;

  const result = await verifySuperAdmin(sessionCookie);

  if (!result.ok) {
    return {
      ok: false,
      response: NextResponse.json(
        { ok: false, reason: result.reason },
        { status: 401 }
      ),
    };
  }

  return { ok: true, uid: result.uid };
}

export async function POST(req, context) {
  const auth = await verifyRequest(req);

  if (!auth.ok) {
    return auth.response;
  }

  const { id } = await context.params;
  const { action } = await req.json();

  if (!id) {
    return NextResponse.json(
      { ok: false, reason: "missing_restaurant_id" },
      { status: 400 }
    );
  }

  const restaurantRef = db.collection("restaurants").doc(id);
  const snap = await restaurantRef.get();

  if (!snap.exists) {
    return NextResponse.json(
      { ok: false, reason: "restaurant_not_found" },
      { status: 404 }
    );
  }

  const now = new Date();

  let updates = null;

  if (action === "trial") {
    updates = {
      platformStatus: "active",
      "billing.status": "trial",
      "billing.monthlyPrice": 350,
      "billing.trialStartedAt": Timestamp.fromDate(now),
      "billing.trialEndsAt": Timestamp.fromDate(addDays(now, 14)),
      "billing.paidUntil": null,
    };
  }

  if (action === "paid") {
    updates = {
      platformStatus: "active",
      "billing.status": "paid",
      "billing.monthlyPrice": 350,
      "billing.paidUntil": Timestamp.fromDate(addMonths(now, 1)),
    };
  }

  if (action === "overdue") {
    updates = {
      "billing.status": "overdue",
    };
  }

  if (action === "suspend") {
    updates = {
      platformStatus: "suspended",
    };
  }

  if (action === "activate") {
    updates = {
      platformStatus: "active",
    };
  }

  if (action === "free") {
    updates = {
      platformStatus: "active",
      "billing.status": "free",
      "billing.monthlyPrice": 0,
      "billing.paidUntil": null,
    };
  }

  if (!updates) {
    return NextResponse.json(
      { ok: false, reason: "invalid_action" },
      { status: 400 }
    );
  }

  await restaurantRef.update(updates);

  return NextResponse.json({
    ok: true,
    action,
    restaurantId: id,
  });
}