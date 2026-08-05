import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { adminAuth, db } from "@/lib/firebase-admin";

export async function getPanelSession() {
  const cookieStore = await cookies();
  const sessionCookie =
    cookieStore.get("panel_token")?.value;

  if (!sessionCookie) {
    return null;
  }

  let decodedToken;

  try {
    decodedToken =
      await adminAuth.verifySessionCookie(
        sessionCookie,
        true,
      );
  } catch (error) {
    console.error(
      "Cookie del panel inválida:",
      error,
    );

    return null;
  }

  const restaurantSnapshot = await db
    .collection("restaurants")
    .where("uid", "==", decodedToken.uid)
    .limit(1)
    .get();

  if (restaurantSnapshot.empty) {
    return null;
  }

  const restaurantDocument =
    restaurantSnapshot.docs[0];

  const restaurant =
    restaurantDocument.data();

  if (restaurant?.platformStatus === "suspended") {
    return null;
  }

  return {
    uid: decodedToken.uid,
    email: decodedToken.email || null,
    restaurantId: restaurantDocument.id,
    restaurant,
  };
}

export async function requireRestaurant() {
  const session = await getPanelSession();

  if (!session) {
    redirect("/login");
  }

  return session;
}