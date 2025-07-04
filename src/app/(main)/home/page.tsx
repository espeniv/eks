import { PostCreator } from "@/components/post-creator";
import { PostCard } from "@/components/post-card";
import { Post } from "@/lib/types";

export default function HomePage() {
  //Dummy data for now
  const samplePosts: Post[] = [
    {
      id: "1",
      content: "Just built my first Next.js app! The App Router is amazing 🚀",
      author: {
        id: "user1",
        username: "johndoe",
        displayName: "John Doe",
        avatar: undefined,
        followers: 123,
        following: 123,
      },
      likes: 24,
      createdAt: "2h",
    },
    {
      id: "2",
      content:
        "Learning React step by step. The component model makes so much sense! 💡\n\nBreaking down complex UIs into small, reusable pieces is brilliant.",
      author: {
        id: "user2",
        username: "janesmith",
        displayName: "Jane Smith",
        avatar: undefined,
        followers: 123,
        following: 123,
      },
      likes: 15,
      createdAt: "4h",
    },
    {
      id: "3",
      content:
        "Hot take: TypeScript makes JavaScript development so much better. The type safety catches bugs before they happen! 🐛✨",
      author: {
        id: "user3",
        username: "devmike",
        displayName: "Mike Chen",
        avatar: undefined,
        followers: 123,
        following: 123,
      },
      likes: 42,
      createdAt: "6h",
    },
    {
      id: "4",
      content:
        "Coffee ☕ + Code 💻 = Perfect morning\n\nWorking on a new feature today. What's everyone else building?",
      author: {
        id: "user4",
        username: "sarahdev",
        displayName: "Sarah Wilson",
        avatar: undefined,
        followers: 123,
        following: 123,
      },
      likes: 18,
      createdAt: "8h",
    },
  ];
  return (
    <div className="max-w-2xl">
      <div className="border-b border-gray-800 p-4 sticky top-0 bg-black">
        <h1 className="text-xl font-bold">Home</h1>
      </div>
      <PostCreator />
      {samplePosts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
