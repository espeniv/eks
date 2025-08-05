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
            {post.imageUrl && (
              <div className="my-3">
                <Image
                  src={post.imageUrl}
                  alt="Attached image"
                  width={400}
                  height={300}
                  className="rounded-lg w-[90%1] object-cover"
                  style={{ height: "auto" }}
                />
              </div>
            )}
            <div className="flex items-center space-x-6 mt-4">
              <button
                className={`flex items-center space-x-2 ${
                  currentUser?.id !== post.author.id
                    ? "hover:text-orange-400 rounded-full transition-colors cursor-pointer"
                    : ""
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleLikeClick();
                }}
              >
                <span>
                  {isPostLikedByUser(post.id) ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="text-red-600 w-6 h-6 ml-1"
                      viewBox="0 0 24 24"
                    >
                      <path
                        fill="currentColor"
                        d="M21.19 12.683c-2.5 5.41-8.62 8.2-8.88 8.32a.848.848 0 0 1-.62 0c-.25-.12-6.38-2.91-8.88-8.32c-1.55-3.37-.69-7 1-8.56a4.93 4.93 0 0 1 4.36-1.05a6.16 6.16 0 0 1 3.78 2.62a6.15 6.15 0 0 1 3.79-2.62a4.93 4.93 0 0 1 4.36 1.05c1.78 1.56 2.65 5.19 1.09 8.56"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-6 h-6 ml-1"
                      viewBox="0 0 24 24"
                    >
                      <path
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.5"
                        d="M12 7.23c-1.733-3.924-5.764-4.273-7.641-2.562c-1.529 1.373-2.263 4.665-.867 7.695C5.9 17.573 12 20.309 12 20.309s6.101-2.736 8.508-7.946c1.396-3.03.662-6.322-.867-7.695C17.764 2.957 13.733 3.306 12 7.229"
                      />
                    </svg>
                  )}
                </span>
                <span className="text-base md:text-lg">{post.likes}</span>
              </button>
              <div className="flex items-center space-x-2">
                <span className="text-lg">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-6 h-6 ml-1"
                    viewBox="0 0 24 24"
                  >
                    <g
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                    >
                      <path d="M21.25 12a9.226 9.226 0 0 1-2.705 6.54A9.251 9.251 0 0 1 12 21.25a9.189 9.189 0 0 1-3.795-.81l-3.867.572a1.195 1.195 0 0 1-1.361-1.43l.537-3.923A8.943 8.943 0 0 1 2.75 12a9.228 9.228 0 0 1 2.705-6.54A9.25 9.25 0 0 1 12 2.75a9.26 9.26 0 0 1 6.545 2.71A9.236 9.236 0 0 1 21.25 12" />
                      <path d="M12 12.61a.61.61 0 1 0 0-1.221a.61.61 0 0 0 0 1.221m4.279 0a.61.61 0 1 0 0-1.221a.61.61 0 0 0 0 1.221m-8.558 0a.61.61 0 1 0 .001-1.221a.61.61 0 0 0 0 1.221" />
                    </g>
                  </svg>
                </span>
                <span className="text-base md:text-lg">
                  {post.commentCount ?? 0}
                </span>
              </div>
              <button
                className="flex items-center space-x-2 hover:text-orange-400 rounded-full transition-colors cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  navigator.clipboard.writeText(
                    `${window.location.origin}/post/${post.id}`
                  );
                }}
                title="Copy link"
              >
                <span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-white hover:text-orange-400 w-5 h-5"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 13a5 5 0 0 0 8 1l4-4a1 1 0 0 0-7-7l-2 2m3 6a5 5 0 0 0-8-1l-4 4a1 1 0 0 0 7 7l2-2"
                    />
                  </svg>
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
