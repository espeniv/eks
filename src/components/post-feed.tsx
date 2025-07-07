"use client";

import { PostCard } from "@/components/post-card";
import { useApp } from "@/context/app-context";
import { Post } from "@/lib/types";

export function PostFeed() {
  const { posts } = useApp();

  return (
    <div>
      {posts.length > 0 ? (
        posts.map((post: Post) => <PostCard key={post.id} post={post} />)
      ) : (
        <div className="p-8 text-center">
          <p className="text-gray-500">No posts yet</p>
        </div>
      )}
    </div>
  );
}
