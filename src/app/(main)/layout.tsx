export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-6xl mx-auto flex">
        <aside className="w-64 p-4 border-r border-gray-800">
          <nav className="space-y-2">
            <a
              href="/home"
              className="block p-3 rounded-full hover:bg-gray-900"
            >
              Home
            </a>
            <a
              href="/explore"
              className="block p-3 rounded-full hover:bg-gray-900"
            >
              Explore
            </a>
          </nav>
        </aside>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
