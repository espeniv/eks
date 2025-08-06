"use client";

import { useRef, useState } from "react";
import { useApp } from "@/context/app-context";
import Image from "next/image";
import { toast } from "sonner";

export function PostCreator() {
  const { addPost, currentUser } = useApp();
  const [postContent, setPostContent] = useState("");
  const [remainingChars, setRemainingChars] = useState(140);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handlePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (postContent.trim() || selectedFile) {
      addPost(postContent, selectedFile);
      setPostContent("");
      setSelectedFile(null);
      setRemainingChars(140);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setPreviewUrl(null);
    }
  };

  const handlePostChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    if (newValue.length <= postContent.length || newValue.length <= 140) {
      setPostContent(newValue);
      setRemainingChars(140 - newValue.length);

      //Smooth text area size adjustment
      const textarea = e.target;
      textarea.style.height = "auto";
      textarea.style.height = textarea.scrollHeight + "px";
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (file) {
      //Limit is 5MB on backend
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File is too big to upload", {
          style: {
            background: "#dc2626",
            color: "black",
            fontSize: "16px",
            border: "0px solid black",
            boxShadow:
              "0 16px 64px 0 rgba(0,0,0,0.75), 0 8px 32px 0 rgba(0,0,0,0.55)",
            textAlign: "center",
            justifyContent: "center",
            userSelect: "none",
            borderRadius: "50px",
          },
        });
      } else {
        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
        if (textareaRef.current) {
          textareaRef.current.style.height = "auto";
        }
      }
    }
  };

  return (
    <form
      onSubmit={handlePostSubmit}
      className="border-b border-gray-800 p-3 md:p-4"
    >
      <div className="flex space-x-4">
        <div className="flex-1">
          <textarea
            ref={textareaRef}
            value={postContent}
            onChange={handlePostChange}
            placeholder={`What's happening ${
              currentUser?.displayName.split(" ")[0]
            }?`}
            className="w-full bg-transparent text-base md:text-xl placeholder-gray-500 resize-none outline-none border-none overflow-hidden"
            rows={previewUrl ? 1 : 3}
          />
          {previewUrl && (
            <div className="relative inline-block my-5">
              <Image
                src={previewUrl}
                alt="Preview image"
                width={300}
                height={100}
                className="rounded-lg object-contain"
                style={{ height: "auto" }}
              />
              <button
                type="button"
                onClick={() => {
                  setSelectedFile(null);
                  setPreviewUrl(null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                  if (textareaRef.current) {
                    textareaRef.current.style.height = "auto";
                  }
                }}
                className="absolute top-[-16] right-[-16] bg-red-600 text-white rounded-full py-1 px-2.5  hover:bg-red-500 border-black border-6 transition cursor-pointer"
                aria-label="Remove preview"
              >
                ✕
              </button>
            </div>
          )}
          <div className="flex justify-between items-center">
            <span
              className={`text-xs md:text-sm select-none ${
                remainingChars == 0 ? "text-red-500" : "text-gray-700"
              }`}
            >
              {remainingChars} characters remaining
            </span>
            <div className="flex items-center space-x-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              {!selectedFile && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-900 text-gray-200 hover:text-orange-500 transition cursor-pointer"
                  aria-label="Upload image"
                >
                  <svg
                    className="w-6.5 h-6.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.75}
                  >
                    <rect x="4" y="4" width="16" height="16" rx="3" />
                    <circle cx="9" cy="9" r="2.5" />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M20 15l-5-5a2 2 0 0 0-2.828 0l-7.172 7"
                    />
                  </svg>
                </button>
              )}
              <button
                type="submit"
                disabled={(!selectedFile && !postContent) || remainingChars < 0}
                className={`bg-orange-500 text-white px-6 py-2 rounded-full text-sm md:text-base font-bold hover:bg-orange-400 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer`}
              >
                Post
              </button>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
