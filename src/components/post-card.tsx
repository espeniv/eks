"use client";

import { Post } from "@/lib/types";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/app-context";
import { formatRelativeTime } from "@/lib/utils";

interface PostCardProps {
  post: Post;
  singlePostView?: boolean;
}

export function PostCard({ post, singlePostView }: PostCardProps) {
  const router = useRouter();

  const { togglePostLike, isPostLikedByUser, currentUser } = useApp();

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
    if (currentUser?.id !== post.author.id) {
      togglePostLike(post.id);
    }
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
            </div>

            <p className="mt-1">{post.content}</p>
          </div>
          <div>
            <button
              className={`flex items-center space-x-2 ml-4 pr-3 ${
                //Check if currentuser is owner of a post to disable liking
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
