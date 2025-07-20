"use client";

import { Sidebar } from "@/components/sidebar";
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
      <div className="max-w-4xl mx-auto flex">
        <div className="fixed top-0 h-screen z-10">
          <Sidebar />
        </div>
        <main className="flex-1 border-r border-gray-800 pl-64 h-screen">
          {children}
        </main>
      </div>
    </div>
  );
}
