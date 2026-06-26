import { db } from "@/lib/firebase-admin";
import { Timestamp } from "firebase-admin/firestore";

function toDate(value) {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value.toDate === "function") return value.toDate();

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function toNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function getCurrentMonthBounds() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  return {
    startOfMonth,
    startOfNextMonth,
    startTs: Timestamp.fromDate(startOfMonth),
    nextTs: Timestamp.fromDate(startOfNextMonth),
  };
}

function emptyRestaurantMonthMetrics() {
  return {
    pedidosEsteMes: 0,
    ventasOnlineEsteMes: 0,
    ventasManualesEsteMes: 0,
    ventasTotalesEsteMes: 0,
  };
}

function normalizeRestaurant(id, data = {}) {
  const billing = data.billing || {};
  const whatsappBot = data.whatsappBot || {};
  const whatsappStats = data.whatsappStats || {};

  return {
    id,
    name: data.name || "Sin nombre",
    slug: data.slug || "sin-slug",
    uid: data.uid || "",
    phone: data.phone || "",
    address: data.address || "",
    pfp: data.pfp || "",
    banner: data.banner || "",

    isOpen: data.isOpen ?? false,
    alwaysOpen: data.alwaysOpen ?? false,

    platformStatus: data.platformStatus || "active",

    billing: {
      status: billing.status || "trial",
      monthlyPrice: toNumber(billing.monthlyPrice ?? 350),
      trialStartedAt: toDate(billing.trialStartedAt),
      trialEndsAt: toDate(billing.trialEndsAt),
      paidUntil: toDate(billing.paidUntil),
    },

    whatsappBot: {
      enabled: whatsappBot.enabled ?? false,
      error: whatsappBot.error || null,
      lastQrAt: toDate(whatsappBot.lastQrAt),
      lastStatusAt: toDate(whatsappBot.lastStatusAt),
      linkedAt: toDate(whatsappBot.linkedAt),
      linkedPhone: whatsappBot.linkedPhone || "",
      sessionId: whatsappBot.sessionId || "",
      status: whatsappBot.status || "disconnected",
    },

    whatsappStats: {
      failedThisMonth: toNumber(whatsappStats.failedThisMonth),
      sentThisMonth: toNumber(whatsappStats.sentThisMonth),
      lastSentAt: toDate(whatsappStats.lastSentAt),
    },
  };
}

export async function getAdminRestaurants() {
  const { startTs, nextTs } = getCurrentMonthBounds();

  const [restaurantsSnap, ordersSnap, manualSalesSnap] = await Promise.all([
    db.collection("restaurants").get(),

    db
      .collection("orders")
      .where("creadoEn", ">=", startTs)
      .where("creadoEn", "<", nextTs)
      .get(),

    db
      .collection("manual_sales")
      .where("creadoEn", ">=", startTs)
      .where("creadoEn", "<", nextTs)
      .get(),
  ]);

  const metricsByRestaurant = new Map();

  function ensureMetrics(restaurantId) {
    if (!metricsByRestaurant.has(restaurantId)) {
      metricsByRestaurant.set(restaurantId, emptyRestaurantMonthMetrics());
    }

    return metricsByRestaurant.get(restaurantId);
  }

  ordersSnap.forEach((doc) => {
    const data = doc.data();
    const restaurantId = data.restaurantId;

    if (!restaurantId) return;

    const metrics = ensureMetrics(restaurantId);
    metrics.pedidosEsteMes += 1;
    metrics.ventasOnlineEsteMes += toNumber(data.total);
    metrics.ventasTotalesEsteMes =
      metrics.ventasOnlineEsteMes + metrics.ventasManualesEsteMes;
  });

  manualSalesSnap.forEach((doc) => {
    const data = doc.data();
    const restaurantId = data.restaurantId;

    if (!restaurantId) return;

    const metrics = ensureMetrics(restaurantId);
    metrics.ventasManualesEsteMes += toNumber(data.total);
    metrics.ventasTotalesEsteMes =
      metrics.ventasOnlineEsteMes + metrics.ventasManualesEsteMes;
  });

  const restaurants = restaurantsSnap.docs.map((doc) => {
    const restaurant = normalizeRestaurant(doc.id, doc.data());
    const metrics = metricsByRestaurant.get(doc.id) || emptyRestaurantMonthMetrics();

    return {
      ...restaurant,
      metrics,
    };
  });

  restaurants.sort((a, b) => a.name.localeCompare(b.name, "es"));

  const summary = restaurants.reduce(
    (acc, restaurant) => {
      acc.total += 1;

      if (restaurant.platformStatus === "active") acc.active += 1;
      if (restaurant.platformStatus === "suspended") acc.suspended += 1;
      if (restaurant.billing.status === "trial") acc.trial += 1;
      if (restaurant.billing.status === "paid") acc.paid += 1;
      if (restaurant.billing.status === "overdue") acc.overdue += 1;

      acc.monthlyRevenue +=
        restaurant.billing.status === "paid"
          ? toNumber(restaurant.billing.monthlyPrice)
          : 0;

      acc.orders += restaurant.metrics.pedidosEsteMes;
      acc.onlineSales += restaurant.metrics.ventasOnlineEsteMes;
      acc.manualSales += restaurant.metrics.ventasManualesEsteMes;
      acc.totalSales += restaurant.metrics.ventasTotalesEsteMes;

      return acc;
    },
    {
      total: 0,
      active: 0,
      suspended: 0,
      trial: 0,
      paid: 0,
      overdue: 0,
      monthlyRevenue: 0,
      orders: 0,
      onlineSales: 0,
      manualSales: 0,
      totalSales: 0,
    }
  );

  return {
    restaurants,
    summary,
  };
}

export async function getAdminRestaurantDetail(id) {
  const docRef = db.collection("restaurants").doc(id);

  const [restaurantSnap, ordersSnap, manualSalesSnap] = await Promise.all([
    docRef.get(),
    db.collection("orders").where("restaurantId", "==", id).get(),
    db.collection("manual_sales").where("restaurantId", "==", id).get(),
  ]);

  if (!restaurantSnap.exists) return null;

  const restaurant = normalizeRestaurant(restaurantSnap.id, restaurantSnap.data());

  const { startOfMonth, startOfNextMonth } = getCurrentMonthBounds();

  const orders = ordersSnap.docs
    .map((doc) => {
      const data = doc.data();
      const creadoEn = toDate(data.creadoEn);

      return {
        id: doc.id,
        creadoEn,
        clienteNombre: data.cliente?.nombre || "Sin nombre",
        clienteTelefono: data.cliente?.telefono || "",
        total: toNumber(data.total),
        status: data.status || "sin_status",
        metodoPago: data.pago?.metodo || "sin_método",
        tipoEntrega: data.entrega?.tipo || "sin_entrega",
      };
    })
    .sort((a, b) => {
      const dateA = a.creadoEn?.getTime() || 0;
      const dateB = b.creadoEn?.getTime() || 0;
      return dateB - dateA;
    });

  const manualSales = manualSalesSnap.docs
    .map((doc) => {
      const data = doc.data();
      const creadoEn = toDate(data.creadoEn);

      return {
        id: doc.id,
        creadoEn,
        metodo: data.metodo || "sin_método",
        nota: data.nota || "",
        total: toNumber(data.total),
      };
    })
    .sort((a, b) => {
      const dateA = a.creadoEn?.getTime() || 0;
      const dateB = b.creadoEn?.getTime() || 0;
      return dateB - dateA;
    });

  const monthlyOrders = orders.filter((order) => {
    if (!order.creadoEn) return false;
    return order.creadoEn >= startOfMonth && order.creadoEn < startOfNextMonth;
  });

  const monthlyManualSales = manualSales.filter((sale) => {
    if (!sale.creadoEn) return false;
    return sale.creadoEn >= startOfMonth && sale.creadoEn < startOfNextMonth;
  });

  const ventasOnlineEsteMes = monthlyOrders.reduce(
    (sum, order) => sum + toNumber(order.total),
    0
  );

  const ventasManualesEsteMes = monthlyManualSales.reduce(
    (sum, sale) => sum + toNumber(sale.total),
    0
  );

  const metrics = {
    pedidosEsteMes: monthlyOrders.length,
    ventasOnlineEsteMes,
    ventasManualesEsteMes,
    ventasTotalesEsteMes: ventasOnlineEsteMes + ventasManualesEsteMes,
  };

  return {
    restaurant,
    metrics,
    recentOrders: orders.slice(0, 12),
    recentManualSales: manualSales.slice(0, 8),
  };
}