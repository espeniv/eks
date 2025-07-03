export function PostCard() {
  return (
    <div className="border-b border-gray-800 p-4 hover:bg-gray-950 cursor-pointer">
      <div className="flex space-x-3">
        <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center">
          👨
        </div>
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <span className="font-bold">John Doe</span>
            <span className="text-gray-500">@johndoe</span>
            <span className="text-gray-500">·</span>
            <span className="text-gray-500">2h</span>
          </div>
          <p className="mt-1">
            Just built my first Next.js app! The App Router is amazing 🚀
          </p>

          <div className="flex justify-between max-w-md mt-3 text-gray-500">
            <button className="flex items-center space-x-2 hover:text-blue-400">
              <span>💬</span>
              <span>12</span>
            </button>
            <button className="flex items-center space-x-2 hover:text-green-400">
              <span>🔄</span>
              <span>5</span>
            </button>
            <button className="flex items-center space-x-2 hover:text-red-400">
              <span>🤍</span>
              <span>24</span>
            </button>
            <button className="hover:text-blue-400">
              <span>📤</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
