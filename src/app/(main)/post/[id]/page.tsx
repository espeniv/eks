"use client";

import { PostCard } from "@/components/post-card";
import { CommentField } from "@/components/comment-field";
import { useApp } from "@/context/app-context";
import { use, useEffect } from "react";
import { formatRelativeTime } from "@/lib/utils";
import Link from "next/link";

export default function PostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { getPostById, getCommentsByPostId, fetchComments } = useApp();

  const { id } = use(params);
  const post = getPostById(id);
  const comments = getCommentsByPostId(id);

  useEffect(() => {
    if (id) {
      const timer = setTimeout(() => {
        fetchComments(id);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [id]);

  function getReplies(comments, parentId) {
    return comments.filter((c) => c.parentCommentId === parentId);
  }

  function renderComments(comments, allComments, depth = 0) {
    return comments.map((comment) => (
      <div
        key={comment.id}
        className="border-b border-gray-800/50 bg-black w-full"
      >
        <div
          className="flex items-center"
          style={{ marginLeft: depth * 24, padding: "1rem" }}
        >
          {depth > 0 && (
            <svg
              className="mr-2 flex-shrink-0"
              width="30"
              height="30"
              viewBox="0 0 30 30"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M9 2V14H15"
                stroke="#FFFFFF"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M13 12L15 14L13 16"
                stroke="#FFFFFF"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <Link href={`/profile/${comment.author.username}`}>
                <span className="font-bold hover:underline cursor-pointer">
                  {`${comment.author.avatar || "👤"}   ${
                    comment.author.displayName
                  }`}
                </span>
                <span className="ml-3 text-gray-500">
                  @{comment.author.username}
                </span>
              </Link>
              <span className="text-gray-500">·</span>
              <span className="text-gray-500">
                {formatRelativeTime(comment.createdAt)}
              </span>
            </div>
            <div className="flex justify-between items-start">
              <p className="text-gray-200 flex-1">{comment.content}</p>
            </div>
          </div>
        </div>
        {renderComments(
          getReplies(allComments, comment.id),
          allComments,
          depth + 1
        )}
      </div>
    ));
  }

  //If post is not found
  if (!post) {
    return (
      <div className="max-w-2xl">
        <div className="p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Post not found</h1>
          <p className="text-gray-500">
            The post you are looking for does not exist or has been deleted.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col max-w-2xl">
      <div className="flex-shrink-0 bg-black">
        <PostCard post={post} singlePostView={true} />
        <div className="border-b border-gray-800 p-4">
          <CommentField post={post} />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="space-y-2 p-4">
          {renderComments(
            comments.filter((c) => !c.parentCommentId),
            comments
          )}

          {comments.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              No comments yet...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
