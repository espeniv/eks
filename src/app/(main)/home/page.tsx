"use client";

import { PostCreator } from "@/components/post-creator";
import { PostFeed } from "@/components/post-feed";
import { useApp } from "@/context/app-context";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function HomePage() {
  const { user, loading } = useAuth();
  const { fetchFollowingPosts } = useApp();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"all" | "following">("all");

  useEffect(() => {
    document.title = "Home / Eks";
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetchFollowingPosts();
    }
  }, [user, fetchFollowingPosts]);

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
    <div className="h-screen flex flex-col">
      <div className="flex-shrink-0 bg-black border-b border-gray-800">
        <div className="border-b border-gray-800 p-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">Home</h1>
        </div>
        <PostCreator />
        <div className="border-b border-gray-800">
          <div className="flex">
            <button
              onClick={() => setActiveTab("all")}
              className={`flex-1 py-2 md:py-4 text-center font-medium border-b-2 transition-colors cursor-pointer ${
                activeTab === "all"
                  ? "text-white border-orange-500"
                  : "text-gray-400 hover:text-gray-300 border-transparent"
              }`}
            >
              All Posts
            </button>
            <button
              onClick={() => setActiveTab("following")}
              className={`flex-1 py-2 md:py-4 text-center font-medium border-b-2 transition-colors cursor-pointer ${
                activeTab === "following"
                  ? "text-white border-orange-500"
                  : "text-gray-400 hover:text-gray-300 border-transparent"
              }`}
            >
              Following
            </button>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <PostFeed filterByFollowing={activeTab === "following"} />
      </div>
    </div>
  );
}
