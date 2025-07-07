import { PostCreator } from "@/components/post-creator";
import { PostFeed } from "@/components/post-feed";

export default function HomePage() {
  return (
    <div className="max-w-2xl">
      <div className="border-b border-gray-800 p-4 sticky top-0 bg-black">
        <h1 className="text-xl font-bold">Home</h1>
      </div>
      <PostCreator />
      <PostFeed />
    </div>
  );
}
