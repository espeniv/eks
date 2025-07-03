import { PostCard } from "@/components/post-card";
import { Post } from "@/lib/types";

//Temp until data fetching ig properly implemented
function getPostById(id: string): Post {
  const samplePosts: { [key: string]: Post } = {
    "1": {
      id: "1",
      content:
        "Just built my first Next.js app! The App Router is amazing 🚀\n\nThe way it handles routing and layouts is so clean.",
      author: {
        id: "user1",
        username: "johndoe",
        displayName: "John Doe",
        avatar: undefined,
      },
      likes: 27,
      replies: 15,
      createdAt: "2h",
    },
    "2": {
      id: "2",
      content:
        "Learning React step by step. The component model makes so much sense! 💡",
      author: {
        id: "user2",
        username: "janesmith",
        displayName: "Jane Smith",
        avatar: undefined,
      },
      likes: 18,
      replies: 9,
      createdAt: "4h",
    },
    "3": {
      id: "3",
      content:
        "Hot take: TypeScript makes JavaScript development so much better. The type safety catches bugs before they happen! 🐛✨",
      author: {
        id: "user3",
        username: "devmike",
        displayName: "Mike Chen",
        avatar: undefined,
      },
      likes: 42,
      replies: 6,
      createdAt: "6h",
    },
  };

  return (
    samplePosts[id] || {
      id: id,
      content: `Post ${id} not found or has been deleted.`,
      author: {
        id: "unknown",
        username: "unknown",
        displayName: "Unknown User",
        avatar: undefined,
      },
      likes: 0,
      replies: 0,
      createdAt: "unknown",
    }
  );
}

export default function PostPage({ params }: { params: { id: string } }) {
  const post = getPostById(params.id);
  return (
    <div className="max-w-2xl">
      <PostCard post={post} />

      <div className="p-4">
        <div className="border-b border-gray-800 pb-4 mb-4 -mx-4 scroll-px-44">
          <h2 className="text-lg font-bold">Replies</h2>
        </div>

        {/* Dummy data for now */}
        <div className="space-y-4">
          <div className="flex space-x-3">
            <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
              👤
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <span className="font-bold">Alice Johnson</span>
                <span className="text-gray-500">@alicej</span>
                <span className="text-gray-500">·</span>
                <span className="text-gray-500">1h</span>
              </div>
              <p className="mt-1">This is so helpful! Thanks for sharing 👍</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
