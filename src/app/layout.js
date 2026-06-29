import { Onest, Geist_Mono } from "next/font/google";
import "./globals.css";
import CartProvider from "@/components/CartProvider";
import { ErrorProvider } from "@/components/ErrorProvider";
import { SuccessProvider } from "@/components/SuccessProvider";


// Fuente principal
const onest = Onest({
  subsets: ["latin"],
});

// Opcional (para números/código)
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Platillo",
  description: "Pedidos en línea",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className={`${onest.className} ${geistMono.variable} antialiased`}>
        <ErrorProvider>
          <SuccessProvider>
            <CartProvider>
              {children}
            </CartProvider>
          </SuccessProvider>
        </ErrorProvider>
      </body>
    </html>
  );
}