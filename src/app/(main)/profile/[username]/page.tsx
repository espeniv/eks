import { PostCard } from "@/components/post-card";
import { User, Post } from "@/lib/types";

//Temp before endpoints/proper fetching
function getUserByUsername(username: string): User | null {
  const sampleUsers: { [key: string]: User } = {
    johndoe: {
      id: "user1",
      username: "johndoe",
      displayName: "John Doe",
      avatar: undefined,
      bio: "Full-stack developer passionate about React and Next.js 🚀",
      followers: 1250,
      following: 890,
    },
    janesmith: {
      id: "user2",
      username: "janesmith",
      displayName: "Jane Smith",
      avatar: undefined,
      bio: "UI/UX Designer • Coffee enthusiast ☕ • Building beautiful experiences",
      followers: 750,
      following: 430,
    },
  };

  return sampleUsers[username] || null;
}

function getPostsByUser(userId: string): Post[] {
  const allPosts: Post[] = [
    {
      id: "1",
      content: "Just built my first Next.js app! The App Router is amazing 🚀",
      author: {
        id: "user1",
        username: "johndoe",
        displayName: "John Doe",
        avatar: undefined,
        bio: "Full-stack developer passionate about React and Next.js 🚀",
        followers: 1250,
        following: 890,
      },
      likes: 24,
      createdAt: "2h",
    },
    {
      id: "2",
      content:
        "Learning React step by step. The component model makes so much sense! 💡",
      author: {
        id: "user2",
        username: "janesmith",
        displayName: "Jane Smith",
        avatar: undefined,
        bio: "UI/UX Designer • Coffee enthusiast ☕",
        followers: 750,
        following: 430,
      },
      likes: 15,
      createdAt: "4h",
    },
  ];

  return allPosts.filter((post) => post.author.id === userId);
}

//Need to implement a different version of this when the visited page is your own profile, alt only show setting button if its your own profile
export default function ProfilePage({
  params,
}: {
  params: { username: string };
}) {
  //Temp solution
  const user = getUserByUsername(params.username);

  //Check if user exists
  if (!user) {
    return (
      <div className="max-w-2xl">
        <div className="p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">User not found</h1>
          <p className="text-gray-500">
            No user with username @{params.username}
          </p>
        </div>
      </div>
    );
  }
  //if user exists

  const userPosts = getPostsByUser(user.id);

  return (
    <div className="max-w-2xl">
      <div className="p-4">
        <div className="relative">
          <div className="flex justify-center pt-8 pb-6">
            <div className="w-32 h-32 bg-gray-600 rounded-full border-4 border-black flex items-center justify-center">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.displayName}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-4xl">👤</span>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold">{user.displayName}</h1>
                <p className="text-gray-500">@{user.username}</p>
              </div>
              <button className="border border-gray-600 text-white font-bold py-2 px-6 rounded-full hover:bg-gray-900 transition-colors">
                Follow
              </button>
            </div>

            {user.bio && <p className="text-white">{user.bio}</p>}

            <div className="flex gap-6 text-sm">
              <span>
                <span className="font-bold text-white">{user.following}</span>
                <span className="text-gray-500"> Following</span>
              </span>
              <span>
                <span className="font-bold text-white">{user.followers}</span>
                <span className="text-gray-500"> Followers</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="border-b border-gray-800" />

      <div>
        {userPosts.length > 0 ? (
          userPosts.map((post) => <PostCard key={post.id} post={post} />)
        ) : (
          <div className="p-8 text-center">
            <p className="text-gray-500">No posts yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
