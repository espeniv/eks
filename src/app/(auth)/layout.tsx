export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="w-full">{children}</div>
    </div>
  );
}
