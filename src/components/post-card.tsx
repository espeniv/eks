"use client";

import { Post } from "@/lib/types";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/app-context";
import { formatRelativeTime, parseMentions } from "@/lib/utils";
import { useState, useEffect } from "react";

interface PostCardProps {
  post: Post;
  singlePostView?: boolean;
  onProfile?: boolean;
}

export function PostCard({ post, singlePostView, onProfile }: PostCardProps) {
  const router = useRouter();

  const { togglePostLike, isPostLikedByUser, currentUser, deletePost } =
    useApp();

  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  useEffect(() => {
    if (showConfirmDelete) {
      const timer = setTimeout(() => {
        setShowConfirmDelete(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [showConfirmDelete]);

  const handleCardClick = (e: React.MouseEvent) => {
    if (
      (e.target as HTMLElement).closest("a") ||
      (e.target as HTMLElement).closest("button")
    ) {
      return;
    }
    const feed = document.querySelector("[data-feed-scrollable]");
    if (feed) {
      sessionStorage.setItem("homeScroll", feed.scrollTop.toString());
    }
    if (onProfile) {
      router.push(`/post/${post.id}?from=/profile/${post.author.username}`);
    } else {
      router.push(`/post/${post.id}`);
    }
  };

  const handleLikeClick = () => {
    if (currentUser?.id !== post.author.id) {
      togglePostLike(post.id);
    }
  };

  return (
    <div
      className={`border-b border-gray-800 p-4 text-sm md:text-base ${
        !singlePostView ? "hover:bg-gray-950 cursor-pointer" : null
      }`}
      onClick={handleCardClick}
    >
      <div className="flex space-x-3">
        <Link href={`/profile/${post.author.username}`}>
          <div className="w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center">
            {post.author.avatar ? (
              <span className="text-3xl">{post.author.avatar}</span>
            ) : (
              <span className="text-3xl">👤</span>
            )}
          </div>
        </Link>

        <div className="flex-1 flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <Link href={`/profile/${post.author.username}`}>
                <span className="font-bold hover:underline">
                  {post.author.displayName}
                </span>
              </Link>
              <span className="text-gray-500">
                @{post.author.username.toLowerCase()}
              </span>
              <span className="text-gray-500">·</span>
              <span className="text-gray-500">
                {formatRelativeTime(post.createdAt)}
              </span>
              {currentUser?.id === post.author.id ? (
                <>
                  <span className="text-gray-500">·</span>
                  {showConfirmDelete ? (
                    <span
                      className="text-gray-500 hover:text-red-600 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        deletePost(post.id, post.imageUrl);
                        router.push("/home");
                      }}
                    >
                      Confirm Deletion
                    </span>
                  ) : (
                    <span
                      className="text-gray-500 hover:text-orange-500 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowConfirmDelete(true);
                      }}
                    >
                      Delete
                    </span>
                  )}
                </>
              ) : (
                ""
              )}
            </div>
            <p className="mt-1 whitespace-pre-wrap font-mono max-w-lg break-words">
              {parseMentions(post.content)}
            </p>
            {post.imageUrl ? (
              <Image
                src={post.imageUrl}
                alt="Attached image"
                width={250}
                height={250}
                className="rounded-xl"
                style={{ maxWidth: "100%", height: "auto" }}
              />
            ) : (
              ""
            )}
          </div>
          <div>
            <button
              className={`flex items-center space-x-2 ml-4 pr-3 ${
                currentUser?.id !== post.author.id
                  ? "hover:text-orange-400 rounded-full transition-colors cursor-pointer"
                  : ""
              }`}
              onClick={(e) => {
                e.stopPropagation();
                handleLikeClick();
              }}
            >
              <span>{isPostLikedByUser(post.id) ? "❤️" : "🤍"}</span>
              <span>{post.likes}</span>
            </button>
            {!singlePostView ? (
              <div className="flex items-center space-x-2 ml-4 pr-3">
                <span>💬</span>
                <span>{post.commentCount ?? 0}</span>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
