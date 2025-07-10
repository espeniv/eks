import { Sidebar } from "@/components/sidebar";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto flex">
        <Sidebar />
        <main className="flex-1 border-r border-gray-800">{children}</main>
      </div>
    </div>
  );
}
