import type { Metadata } from "next";
import "./globals.css";
import Navigation from "@/components/navigation";

export const metadata: Metadata = {
  title: "OpenAPI Form Builder",
  description: "PoC platformy do budowania formularzy na podstawie OpenAPI",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pl">
      <body className="bg-gray-50 text-gray-900">
        <Navigation />
        {children}
      </body>
    </html>
  );
}
