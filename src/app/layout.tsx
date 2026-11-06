import type { Metadata, Viewport } from "next";
import React from "react";
import { ThemeProvider } from "../context/ThemeContext";
import { OverlayProvider } from "../context/OverlayContext";
import AppShell from "../components/AppShell";
import "./globals.css";
import "./fonts.css";

export const metadata: Metadata = {
  title: "Nils Hellwig - Portfolio",
  description: "Portfolio by Nils Hellwig",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#f9fafb",
};

const themeScript = `try{var t=localStorage.getItem("theme");if(t==="dark"||(!t&&window.matchMedia("(prefers-color-scheme: dark)").matches)){document.documentElement.classList.add("dark")}}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <ThemeProvider>
          <OverlayProvider>
            <AppShell>{children}</AppShell>
          </OverlayProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
