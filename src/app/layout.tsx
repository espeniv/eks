import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/context/app-context";
import { AuthProvider } from "@/context/auth-context";
import { Toaster } from "sonner";

const montserrat = Montserrat({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Eks",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🔶</text></svg>",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${montserrat.className} bg-black text-white font-medium`}
      >
        <AuthProvider>
          <AppProvider>
            {children}
            <Toaster position="top-center" />
          </AppProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
