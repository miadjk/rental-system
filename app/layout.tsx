import type { Metadata, Viewport } from "next";
import { Space_Mono, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/src/store/AuthContext";
import { StoreProvider } from "@/src/store/StoreContext";
import { ToastProvider } from "@/src/components/ui/Toast";
import { RentModalProvider } from "@/src/store/RentModalContext";
import { RegisterSW } from "@/src/components/pwa/RegisterSW";

const spaceMono = Space_Mono({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Cho Rental",
  description: "Minimal, elegant dress rental tracking system for boutique owners.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Cho Rental",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: "#664930",
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${spaceMono.variable} ${jakarta.variable} h-full antialiased`}
    >
      <body className="min-h-dvh bg-[#FAF8F5] text-[#2B2118]">
        <RegisterSW />
        <ToastProvider>
          <AuthProvider>
            <StoreProvider>
              <RentModalProvider>{children}</RentModalProvider>
            </StoreProvider>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
