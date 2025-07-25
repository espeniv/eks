"use client";

import { PostCard } from "@/components/post-card";
import { CommentField } from "@/components/comment-field";
import { useApp } from "@/context/app-context";
import { use, useEffect, useState } from "react";
import { formatRelativeTime } from "@/lib/utils";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Comment } from "@/lib/types";

export default function PostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { getPostById, getCommentsByPostId, fetchComments } = useApp();
  const [replyToId, setReplyToId] = useState<string | null>(null);

  const { id } = use(params);
  const post = getPostById(id);
  const comments = getCommentsByPostId(id);

  const searchParams = useSearchParams();
  const from = searchParams.get("from");
  const backHref = from ? from : "/home";

  useEffect(() => {
    if (id) {
      const timer = setTimeout(() => {
        fetchComments(id);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [id]);

  useEffect(() => {
    document.title = "Post / Eks";
  }, []);

  function getReplies(comments: Comment[], parentId: string) {
    return comments.filter((c) => c.parentCommentId === parentId);
  }

  function renderComments(
    comments: Comment[],
    allComments: Comment[],
    depth = 0
  ) {
    return comments.map((comment) => (
      <div
        key={comment.id}
        className={`${depth === 0 && "border-gray-800 border-b py-3 px-1"}`}
      >
        <div
          className="relative flex items-center group"
          style={{ marginLeft: depth * 60, padding: "0.5rem" }}
        >
          {depth > 0 && (
            <svg
              className="mr-4 flex-shrink-0"
              width="40"
              height="60"
              viewBox="0 0 40 60"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 2V30H32"
                stroke="#1F2937"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M28 26L32 30L28 34"
                stroke="#1F2937"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center mb-2">
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
              <span className="text-gray-500 mx-2">·</span>
              <span className="text-gray-500">
                {formatRelativeTime(comment.createdAt)}
              </span>
            </div>
            <div className="flex justify-between items-start">
              <p className="text-gray-200 flex-1 break-all mr-10">
                {comment.content}
              </p>
            </div>
          </div>
          {!(depth == 3) ? (
            <button
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-transparent text-gray-400 opacity-25 transition-opacity group-hover:opacity-25 hover:opacity-100 hover:text-orange-400 cursor-pointer"
              type="button"
              aria-label="Reply"
              onClick={() => setReplyToId(comment.id)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-5 h-5"
              >
                <path d="M10 9V5l-7 7 7 7v-4c4 0 7 1.5 9 5-1-5-4-10-9-10z" />
              </svg>
            </button>
          ) : null}
        </div>
        {replyToId === comment.id && post != null && (
          <div
            className="pl-2 pr-2 pb-2"
            style={
              depth === 0
                ? undefined
                : {
                    marginLeft: (depth + 1) * 60,
                    maxWidth: `calc(100% - ${(depth + 1) * 60}px)`,
                  }
            }
          >
            <CommentField
              post={post}
              parentCommentId={comment.id}
              onCancel={() => setReplyToId(null)}
            />
          </div>
        )}
        {depth < 3 &&
          renderComments(
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
        <div className=" p-4 flex items-center mb-10">
          <Link
            href={backHref}
            className="ml-2.5 mr-6 transition flex items-center justify-center"
            aria-label="Back to home"
            style={{ minWidth: 0, minHeight: 0 }}
          >
            <svg
              width="30"
              height="30"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              viewBox="0 0 30 30"
              className="text-gray-500 hover:text-white w-6 h-6"
              style={{ display: "block" }}
            >
              <line x1="24" y1="15" x2="7" y2="15" />
              <polyline points="13 9 7 15 13 21" />
            </svg>
          </Link>
          <h1 className="text-xl font-bold">Post</h1>
        </div>
        <div className="pl-8 pr-8 text-center">
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
      <div className=" p-4 flex items-center">
        <Link
          href={backHref}
          className="ml-2.5 mr-6 transition flex items-center justify-center"
          aria-label="Back to home"
          style={{ minWidth: 0, minHeight: 0 }}
        >
          <svg
            width="30"
            height="30"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            viewBox="0 0 30 30"
            className="text-gray-500 hover:text-white w-6 h-6"
            style={{ display: "block" }}
          >
            <line x1="24" y1="15" x2="7" y2="15" />
            <polyline points="13 9 7 15 13 21" />
          </svg>
        </Link>
        <h1 className="text-xl font-bold">Post</h1>
      </div>
      <div className="flex-shrink-0 bg-black">
        <PostCard post={post} singlePostView={true} />
        <div className="border-b border-gray-800 p-4">
          <CommentField post={post} />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="p-2 pt-0">
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
