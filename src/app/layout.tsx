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
      <body className={`${plusJakartaSans.variable} font-sans`}>
        {children}
      </body>
    </html>
  );
}