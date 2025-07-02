import Link from "next/link";

export function Sidebar() {
  return (
    <aside className="w-64 p-4 border-r border-gray-800">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Eks</h1>
      </div>
      <nav className="space-y-2">
        <Link href="/home" className="block p-3 rounded-full hover:bg-gray-900">
          🏠 Home
        </Link>
        <Link
          href="/explore"
          className="block p-3 rounded-full hover:bg-gray-900"
        >
          🔍 Explore
        </Link>
        <Link
          href="/notifications"
          className="block p-3 rounded-full hover:bg-gray-900"
        >
          🔔 Notifications
        </Link>
        <Link
          href="/messages"
          className="block p-3 rounded-full hover:bg-gray-900"
        >
          💬 Messages
        </Link>
      </nav>
    </aside>
  );
}
