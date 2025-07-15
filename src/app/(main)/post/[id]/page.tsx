"use client";

import { PostCard } from "@/components/post-card";
import { CommentField } from "@/components/comment-field";
import { useApp } from "@/context/app-context";
import { use, useEffect } from "react";
import { formatRelativeTime } from "@/lib/utils";

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
  }, [id, fetchComments]);

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
    <div className="max-w-2xl">
      <PostCard post={post} singlePostView={true} />

      <div className="p-4">
        <div className="border-b border-gray-800 pb-4 mb-4 -mx-4 scroll-px-44">
          <CommentField post={post} />
        </div>
        <div className="space-y-2">
          {comments.map((comment) => (
            <div key={comment.id} className="bg-black p-4">
              <div className="flex items-center space-x-2 mb-2">
                <span className="font-bold">{comment.author.displayName}</span>
                <span className="text-gray-500">
                  @{comment.author.username}
                </span>
                <span className="text-gray-500">·</span>
                <span className="text-gray-500">
                  {formatRelativeTime(comment.createdAt)}
                </span>
              </div>
              <div className="flex row-auto justify-between">
                <p className="text-gray-200">{comment.content}</p>
                {/* comment.author.id === currentUser?.id ? (
                  <button className="cursor-pointer px-3 py-1 text-xs text-red-400 hover:text-red-300 bg-red-400/10 hover:bg-red-400/20 rounded-full transition-colors duration-200">
                    Delete
                  </button>
                ) : null */}
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
