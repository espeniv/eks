import Link from "next/link";

export function ProfileSelector(props: { profileId: string }) {
  return (
    <Link href={`/profile/${props.profileId}`}>
      <div className="flex items-center p-3 rounded-full hover:bg-gray-900">
        <div className="w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center">
          👤
        </div>
        <h3 className="ml-3">Testuser</h3>
      </div>
    </Link>
  );
}
