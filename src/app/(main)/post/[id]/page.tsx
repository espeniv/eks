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

  //Case if post is not found
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
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="bg-black p-4 border-b border-gray-800/50"
            >
              <div className="flex items-center space-x-2 mb-2">
                <Link href={`/profile/${comment.author.username}`}>
                  <span className="font-bold hover:underline cursor-pointer">
                    {comment.author.displayName}
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
                {/*
                {{comment.author.id === currentUser?.id && (
                  <button className="cursor-pointer px-3 py-1 text-xs text-red-400 hover:text-red-300 bg-red-400/10 hover:bg-red-400/20 rounded-full transition-colors duration-200 ml-4 flex-shrink-0">
                    Delete
                  </button>
                )} */}
              </div>
            </div>
          ))}

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
