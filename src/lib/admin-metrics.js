import { db } from "@/lib/firebase-admin";
import { Timestamp } from "firebase-admin/firestore";

export async function getAdminMetrics() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const tsStart = Timestamp.fromDate(startOfMonth);
  const tsEnd = Timestamp.fromDate(startOfNextMonth);

  // ─── Restaurantes ───────────────────────────────────────────────────────
  const restaurantsSnap = await db.collection("restaurants").get();
  const restaurants = restaurantsSnap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  }));

  const restaurantesTotales = restaurants.length;
  const restaurantesActivos = restaurants.filter((r) => r.platformStatus === "active").length;
  const restaurantesSuspendidos = restaurants.filter((r) => r.platformStatus === "suspended").length;
  const restaurantesEnPrueba = restaurants.filter((r) => r.billing?.status === "trial").length;
  const clientesPagando = restaurants.filter((r) => r.billing?.status === "paid").length;
  const clientesVencidos = restaurants.filter((r) => r.billing?.status === "overdue").length;

  const ingresoMensualEstimado = restaurants
    .filter((r) => r.billing?.status === "paid")
    .reduce((acc, r) => acc + (r.billing?.monthlyPrice || 0), 0);

  const mensajesEnviados = restaurants.reduce(
    (acc, r) => acc + (r.whatsappStats?.sentThisMonth || 0), 0
  );
  const mensajesFallidos = restaurants.reduce(
    (acc, r) => acc + (r.whatsappStats?.failedThisMonth || 0), 0
  );

  // ─── Pedidos del mes ────────────────────────────────────────────────────
  const ordersSnap = await db
    .collection("orders")
    .where("creadoEn", ">=", tsStart)
    .where("creadoEn", "<", tsEnd)
    .get();

  const pedidosEsteMes = ordersSnap.size;
  const ventasPedidosEsteMes = ordersSnap.docs.reduce(
    (acc, d) => acc + (d.data().total || 0), 0
  );

  // ─── Ventas manuales del mes ─────────────────────────────────────────────
  const manualSnap = await db
    .collection("manual_sales")
    .where("creadoEn", ">=", tsStart)
    .where("creadoEn", "<", tsEnd)
    .get();

  const ventasManualesEsteMes = manualSnap.docs.reduce(
    (acc, d) => acc + (d.data().total || 0), 0
  );

  const ventasTotalesEsteMes = ventasPedidosEsteMes + ventasManualesEsteMes;

  return {
    restaurantesTotales,
    restaurantesActivos,
    restaurantesSuspendidos,
    restaurantesEnPrueba,
    clientesPagando,
    clientesVencidos,
    ingresoMensualEstimado,
    pedidosEsteMes,
    ventasPedidosEsteMes,
    ventasManualesEsteMes,
    ventasTotalesEsteMes,
    mensajesEnviados,
    mensajesFallidos,
  };
}