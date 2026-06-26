import { headers } from "next/headers";
import LandingClient from "./LandingClient";

export default async function Page() {
  const headersList = await headers();
  const host = headersList.get("host") || "";

  if (host === "admin.platillo.mx") {
    return (
      <main style={{ padding: 40 }}>
        <h1>Página de admin</h1>
      </main>
    );
  }

  return <LandingClient />;
}