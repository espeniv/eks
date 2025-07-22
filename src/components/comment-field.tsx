"use client";

import { useApp } from "@/context/app-context";
import { Post } from "@/lib/types";
import { useState } from "react";

interface CommentFieldProps {
  post: Post;
}

export function CommentField({ post }: CommentFieldProps) {
  const { addComment, fetchPosts, fetchFollowingPosts } = useApp();
  const [commentContent, setCommentContent] = useState("");
  const [remainingChars, setRemainingChars] = useState(140);

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (commentContent.trim()) {
      await addComment(post.id, commentContent);
      setCommentContent("");
      setRemainingChars(140);
      await fetchPosts();
      await fetchFollowingPosts();
    }
  };

  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    if (newValue.length <= commentContent.length || newValue.length < 140) {
      setCommentContent(newValue);
      setRemainingChars(140 - newValue.length);
    }
  };

  return (
    <form onSubmit={handleCommentSubmit} className="p-4 py-0.5">
      <div className="flex space-x-4">
        <div className="flex-1">
          <textarea
            value={commentContent}
            onChange={handleCommentChange}
            placeholder={`What do you think about this?`}
            className="w-full bg-transparent text-m placeholder-gray-500 resize-none outline-none border-none"
            rows={3}
          />
          <div className="flex justify-end items-center mt-4setPostContent(e.target.value)">
            <button
              type="submit"
              disabled={!commentContent.trim() || remainingChars < 0}
              className="bg-orange-500 text-white px-6 py-2 rounded-full font-bold hover:bg-orange-400 disabled:opacity-50"
            >
              Reply
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
