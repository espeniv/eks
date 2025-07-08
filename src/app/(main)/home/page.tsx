"use client";

import { PostCreator } from "@/components/post-creator";
import { PostFeed } from "@/components/post-feed";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="max-w-2xl">
        <div className="p-8 text-center">
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-2xl">
      <div className="border-b border-gray-800 p-4 sticky top-0 bg-black flex justify-between items-center">
        <h1 className="text-xl font-bold">Home</h1>
      </div>
      <PostCreator />
      <PostFeed />
    </div>
  );
}
