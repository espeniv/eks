"use client";

import { PostCard } from "@/components/post-card";
import { useApp } from "@/context/app-context";
import { Post } from "@/lib/types";
import { useEffect, useMemo, useRef, useState } from "react";

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
  const prevFilterRef = useRef<boolean | undefined>(undefined);
  const [scrollReady, setScrollReady] = useState(false);

  const filteredPosts = useMemo(() => {
    if (filterByFollowing) {
      return followingPosts;
    }

    if (filterByUserId) {
      return posts.filter((post) => post.author.id === filterByUserId);
    }

    return posts;
  }, [posts, followingPosts, filterByUserId, filterByFollowing]);

  useEffect(() => {
    setScrollReady(true);
  }, [filteredPosts.length]);

  //Restore scroll position when navigation "back", only after posts has loaded, and not on profile view
  useEffect(() => {
    if (scrollReady && feedRef.current && !filterByUserId) {
      const scroll = sessionStorage.getItem("homeScroll");
      if (scroll) {
        feedRef.current.scrollTop = parseInt(scroll, 10);
        sessionStorage.removeItem("homeScroll");
      }
      setScrollReady(true);
    }
  }, [scrollReady]);

  //To reset scroll position to top only if user switches feed tab, not on all mounts of feed
  useEffect(() => {
    if (
      prevFilterRef.current !== undefined &&
      prevFilterRef.current !== filterByFollowing
    ) {
      if (feedRef.current) {
        feedRef.current.scrollTop = 0;
      }
    }
    prevFilterRef.current = filterByFollowing;
  }, [filterByFollowing]);

  return (
    <div ref={feedRef} data-feed-scrollable className="overflow-y-auto h-full">
      {scrollReady &&
        (filteredPosts.length > 0 ? (
          filteredPosts.map((post: Post) => (
            <PostCard
              key={post.id}
              post={post}
              onProfile={onProfile}
              feedTab={filterByFollowing ? "following" : "all"}
            />
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
        ))}
    </div>
  );
}
