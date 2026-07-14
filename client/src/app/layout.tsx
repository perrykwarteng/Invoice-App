import type { Metadata } from "next";
import { Saira } from "next/font/google";
import "./globals.css";
import Providers from "@/components/ui/Providers";
import { Toaster } from "sonner";

const SairaFont = Saira({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "SwiftInvoice",
  description: "Invoice App",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${SairaFont.className} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <Providers>
          <Toaster position="top-center" />
          {children}
        </Providers>
      </body>
    </html>
  );
}
