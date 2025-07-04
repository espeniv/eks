import { Post } from "@/lib/types";
import Image from "next/image";
import Link from "next/link";

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  return (
    <div className="border-b border-gray-800 p-4 hover:bg-gray-950 cursor-pointer">
      <div className="flex space-x-3">
        <Link href={`/profile/${post.author.username}`}>
          <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center">
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
        <Link href={`/post/${post.id}`}>
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <Link href={`/profile/${post.author.username}`}>
                <span className="font-bold">{post.author.displayName}</span>
              </Link>
              <span className="text-gray-500">{post.author.username}</span>
              <span className="text-gray-500">·</span>
              <span className="text-gray-500">{post.createdAt}</span>
            </div>
            <p className="mt-1">{post.content}</p>
            <div className="flex justify-around max-w-md mt-3 text-gray-500">
              <button className="flex items-center space-x-2 hover:text-red-400">
                <span>🤍</span>
                <span>{post.likes}</span>
              </button>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
