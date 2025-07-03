import Link from "next/link";
import { ProfileSelector } from "./profile-selector";

export function Sidebar(props: { profileId: string }) {
  return (
    <aside className="w-64 p-4 border-r border-gray-800 flex flex-col h-screen">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Eks</h1>
      </div>
      <nav className="space-y-2">
        <Link href="/home" className="block p-3 rounded-full hover:bg-gray-900">
          🏠 Home
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
        <Link
          href={`/profile/${props.profileId}`}
          className="block p-3 rounded-full hover:bg-gray-900"
        >
          👤 Profile
        </Link>
      </nav>
      <div className="mt-auto">
        <ProfileSelector profileId={props.profileId} />
      </div>
    </aside>
  );
}
