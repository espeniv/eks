export function PostCreator() {
  return (
    <div className="border-b border-gray-800 p-4">
      <div className="flex space-x-4">
        <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center">
          👤
        </div>

        <div className="flex-1">
          <textarea
            placeholder="What's happening?"
            className="w-full bg-transparent text-xl placeholder-gray-500 resize-none outline-none border-none"
            rows={3}
          />

          <div className="flex justify-around items-center mt-4">
            <button className=" bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-full">
              Post
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
