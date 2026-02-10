import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { MqttProvider } from "@/components/MqttProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "SmartMocaf | IoT Fermentation Monitoring",
  description: "Sistem monitoring pintar untuk proses fermentasi mocaf dengan kontrol pH otomatis.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <MqttProvider>
          {children}
        </MqttProvider>
      </body>
    </html>
  );
}
