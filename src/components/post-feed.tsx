"use client";

import { PostCard } from "@/components/post-card";
import { useApp } from "@/context/app-context";
import { Post } from "@/lib/types";
import { useEffect, useMemo, useRef } from "react";

interface PostFeedProps {
  filterByUserId?: string;
  filterByFollowing?: boolean;
  onProfile?: boolean;
}

export function PostFeed({
  filterByUserId,
  filterByFollowing,
  onProfile,
}: PostFeedProps) {
  const { posts, followingPosts } = useApp();
  const feedRef = useRef<HTMLDivElement>(null);

  //Restore scroll position when navigation "back"
  useEffect(() => {
    const scroll = sessionStorage.getItem("homeScroll");
    if (scroll && feedRef.current) {
      feedRef.current.scrollTop = parseInt(scroll, 10);
      sessionStorage.removeItem("homeScroll");
    }
  }, []);

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
    <div
      ref={feedRef}
      data-feed-scrollable
      style={{
        overflowY: "auto",
        height: window.innerWidth < 768 ? "90%" : "100%",
      }}
    >
      {filteredPosts.length > 0 ? (
        filteredPosts.map((post: Post) => (
          <PostCard key={post.id} post={post} onProfile={onProfile} />
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
