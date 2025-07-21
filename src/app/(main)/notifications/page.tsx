import { useApp } from "@/context/app-context";

export default function NotificationsPage() {
  const {
    fetchNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
  } = useApp();
  return (
    <div className="h-screen flex flex-col">
      <div className="flex-shrink-0 bg-black border-b border-gray-800">
        <div className="border-b border-gray-800 p-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">Notifications</h1>
        </div>
      </div>
    </div>
  );
}
