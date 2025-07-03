import { PostCreator } from "@/components/post-creator";
import { PostCard } from "@/components/post-card";

export default function HomePage() {
  return (
    <div className="max-w-2xl">
      <div className="border-b border-gray-800 p-4 sticky top-0 bg-black">
        <h1 className="text-xl font-bold">Home</h1>
      </div>
      <PostCreator />
      <PostCard />
      <PostCard />
      <PostCard />
      <PostCard />
      <PostCard />
      <PostCard />
    </div>
  );
}
