"use client";

import { PostCard } from "@/components/post-card";
import { useApp } from "@/context/app-context";
import { Post } from "@/lib/types";

interface PostFeedProps {
  //Optional if i only want to see posts from a specific user (such as on profile page)
  filterByUserId?: string;
}

export function PostFeed({ filterByUserId }: PostFeedProps) {
  const { posts } = useApp();

  //If provided it will filter based on the userid
  const filteredPosts = filterByUserId
    ? posts.filter((post) => post.author.id === filterByUserId)
    : posts;

  return (
    <div>
      {filteredPosts.length > 0 ? (
        filteredPosts.map((post: Post) => (
          <PostCard key={post.id} post={post} />
        ))
      ) : (
        <div className="p-8 text-center">
          <p className="text-gray-500">No posts yet</p>
        </div>
      )}
    </div>
  );
}
