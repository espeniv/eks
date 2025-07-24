"use client";

import { useApp } from "@/context/app-context";
import { Post } from "@/lib/types";
import { useEffect, useRef, useState } from "react";

interface CommentFieldProps {
  post: Post;
  parentCommentId?: string;
  onCancel?: () => void;
}

export function CommentField({
  post,
  parentCommentId,
  onCancel,
}: CommentFieldProps) {
  const { addComment, fetchPosts, fetchFollowingPosts } = useApp();
  const [commentContent, setCommentContent] = useState("");
  const [remainingChars, setRemainingChars] = useState(140);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (commentContent.trim()) {
      await addComment(post.id, commentContent, parentCommentId);
      if (onCancel) onCancel();
      setCommentContent("");
      setRemainingChars(140);
      await fetchPosts();
      await fetchFollowingPosts();
      if (onCancel) onCancel();
    }
  };

  //To adjust height of comment area with comment length
  const handleInput = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = textarea.scrollHeight + "px";
    }
  };

  //To autofocus
  useEffect(() => {
    if (parentCommentId && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [parentCommentId]);

  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    if (newValue.length <= commentContent.length || newValue.length < 140) {
      setCommentContent(newValue);
      setRemainingChars(140 - newValue.length);
    }
  };

  //Convert to strict boolean
  const isReply = !!parentCommentId;

  return (
    <form
      onSubmit={handleCommentSubmit}
      className={isReply ? "p-0" : "p-1 py-0.5"}
    >
      {isReply ? (
        <div className="flex items-end space-x-2">
          <textarea
            ref={textareaRef}
            value={commentContent}
            onChange={handleCommentChange}
            placeholder="Write a reply..."
            className="flex-1 w-full bg-transparent text-sm placeholder-gray-500 resize-none outline-none border border-gray-700 rounded-xl px-3 py-2"
            rows={2}
          />
          <div className="flex flex-col mb-2">
            <button
              type="button"
              onClick={onCancel}
              className="px-2 py-1 rounded-full text-sm text-gray-400 hover:text-orange-400 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!commentContent.trim() || remainingChars < 0}
              className="bg-orange-500 text-white px-2 py-0.5 rounded-full font-bold text-sm hover:bg-orange-400 disabled:opacity-50 disabled:cursor-default cursor-pointer"
            >
              Reply
            </button>
          </div>
        </div>
      ) : (
        <div className="flex space-x-2">
          <div className="flex-1">
            <textarea
              ref={textareaRef}
              value={commentContent}
              onChange={handleCommentChange}
              onInput={handleInput}
              placeholder="What do you think about this?"
              className="w-full bg-transparent text-m placeholder-gray-500 resize-none outline-none border-none"
              rows={1}
            />
            <div className="flex justify-end items-center">
              <button
                type="submit"
                disabled={!commentContent.trim() || remainingChars < 0}
                className="bg-orange-500 text-white px-4 py-1 rounded-full font-bold hover:bg-orange-400 disabled:opacity-50 cursor-pointer disabled:cursor-default"
              >
                Reply
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
