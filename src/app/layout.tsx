import type { Metadata } from "next";
import { Fredoka } from "next/font/google";
import "./globals.css";
import RegisterSW from "../components/RegisterSW";

const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Obi Dobi — Papelería Creativa & Cotizador Inteligente",
  description: "Cotiza y solicita tus invitaciones digitales interactivas, totebags, stickers y llaveros de resina de forma rápida e inteligente.",
  manifest: "/manifest.json",
  icons: {
    icon: "/logo.png",
  }
};

interface LayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="es"
      className={`${fredoka.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-cream text-forest selection:bg-logo-yellow selection:text-forest">
        <RegisterSW />
        {children}
      </body>
    </html>
  );
}
