"use client";

import { PostCard } from "@/components/post-card";
import { useApp } from "@/context/app-context";
import { Post } from "@/lib/types";
import { useMemo } from "react";

interface PostFeedProps {
  filterByUserId?: string;
  filterByFollowing?: boolean;
}

export function PostFeed({ filterByUserId, filterByFollowing }: PostFeedProps) {
  const { posts, followingPosts } = useApp();

  const filteredPosts = useMemo(() => {
    if (filterByFollowing) {
      return followingPosts;
    }

    if (filterByUserId) {
      return posts.filter((post) => post.author.id === filterByUserId);
    }

    return posts;
  }, [posts, followingPosts, filterByUserId, filterByFollowing]);

  return (
    <div>
      {filteredPosts.length > 0 ? (
        filteredPosts.map((post: Post) => (
          <PostCard key={post.id} post={post} />
        ))
      ) : (
        <div className="p-8 text-center">
          <p className="text-gray-500">
            {filterByFollowing
              ? "No posts from people you follow yet"
              : filterByUserId
              ? "No posts from this user yet"
              : "No posts yet"}
          </p>
        </div>
      )}
    </div>
  );
}
