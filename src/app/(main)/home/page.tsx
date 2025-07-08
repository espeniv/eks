"use client";

import { PostCreator } from "@/components/post-creator";
import { PostFeed } from "@/components/post-feed";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function HomePage() {
  const { user, loading, signOut } = useAuth();
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
        <button
          onClick={() => signOut()}
          className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-sm text-sm"
        >
          Sign out
        </button>
      </div>
      <PostCreator />
      <PostFeed />
    </div>
  );
}
