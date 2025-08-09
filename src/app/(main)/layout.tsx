"use client";

import { Sidebar } from "@/components/sidebar";
import { Navbar } from "@/components/navbar";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (!user) {
    return null;
  }
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto flex items-stretch">
        <aside className="hidden md:block w-64 shrink-0 border-r border-gray-800">
          <div className="sticky top-0 h-screen">
            <Sidebar />
          </div>
        </aside>
        <main className="flex-1 w-full min-h-screen border-r border-gray-800">
          <div className="flex-1 pb-12 md:pb-0">{children}</div>
          <div className="sticky bottom-0 z-30 border-t border-gray-800 bg-black">
            <Navbar />
          </div>
        </main>
      </div>
    </div>
  );
}
