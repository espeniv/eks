"use client";

import { Post } from "@/lib/types";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useApp } from "@/context/app-context";
import { formatRelativeTime } from "@/lib/utils";

interface PostCardProps {
  post: Post;
  singlePostView?: boolean;
}

export function PostCard({ post, singlePostView }: PostCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes);

  const router = useRouter();

  const { likePost } = useApp();

  const handleCardClick = (e: React.MouseEvent) => {
    if (
      (e.target as HTMLElement).closest("a") ||
      (e.target as HTMLElement).closest("button")
    ) {
      return;
    }
    router.push(`/post/${post.id}`);
  };

  const handleLikeClick = () => {
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
    setIsLiked(!isLiked);
    likePost(post.id);
  };

  return (
    <div
      className={`border-b border-gray-800 p-4 ${
        !singlePostView ? "hover:bg-gray-950 cursor-pointer" : null
      }`}
      onClick={handleCardClick}
    >
      <div className="flex space-x-3">
        <Link href={`/profile/${post.author.username}`}>
          <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center hover:opacity-80">
            {post.author.avatar ? (
              <Image
                src={post.author.avatar}
                alt={post.author.displayName}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <span className="text-xl">👤</span>
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
              <span className="text-gray-500">@{post.author.username}</span>
              <span className="text-gray-500">·</span>
              <span className="text-gray-500">
                {formatRelativeTime(post.createdAt)}
              </span>
            </div>

            <p className="mt-1">{post.content}</p>
          </div>

          <button
            className="flex items-center space-x-2 hover:text-orange-400 rounded-full transition-colors ml-4 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              handleLikeClick();
            }}
          >
            <span>{isLiked ? "🧡" : "🤍"}</span>
            <span>{likeCount}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
