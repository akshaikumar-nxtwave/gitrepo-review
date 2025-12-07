"use client";
import "./globals.css";
import { useEffect } from "react";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    const handleUnload = () => {
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith("chat_")) {
          localStorage.removeItem(key);
        }
      });

      navigator.sendBeacon("/api/cleanup-session");
    };

    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  }, []);

  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
