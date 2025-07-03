import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import "./globals.css";

export const metadata: Metadata = {
  title: "PizzaAI - L'IA pour votre pizzeria",
  description: "Automatisez la prise de commande de votre pizzeria avec une IA.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="dark">
      <body className={`${GeistSans.className} bg-background text-foreground`}>
        {children}
      </body>
    </html>
  );
}
