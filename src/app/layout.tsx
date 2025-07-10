import Link from 'next/link';
import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

// Configure the font
const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-plus-jakarta-sans",
});

export const metadata: Metadata = {
  title: "Pizza AI - L'IA pour votre pizzeria",
  description: "Libérez votre temps, laissez l'IA prendre les commandes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={`${plusJakartaSans.variable} font-sans flex flex-col min-h-screen`}>
        <main className="flex-grow">
          {children}
        </main>
        <footer className="bg-gray-100 text-center lg:text-left">
          <div className="p-4 text-center text-gray-700">
            © {new Date().getFullYear()} Pizza AI. Tous droits réservés.
            <Link href="/legal/terms" className="text-gray-800 hover:text-gray-600 ml-4">
              Conditions d&apos;Utilisation
            </Link>
            <Link href="/legal/privacy" className="text-gray-800 hover:text-gray-600 ml-4">
              Politique de Confidentialité
            </Link>
          </div>
        </footer>
      </body>
    </html>
  );
}