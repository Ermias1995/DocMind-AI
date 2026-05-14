export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-muted/40 p-4">
        <h1 className="text-2xl font-bold mb-8">
          DocMind AI
        </h1>

        <nav className="space-y-2">
          <div className="p-2 rounded hover:bg-muted cursor-pointer">
            Dashboard
          </div>

          <div className="p-2 rounded hover:bg-muted cursor-pointer">
            Documents
          </div>

          <div className="p-2 rounded hover:bg-muted cursor-pointer">
            Chats
          </div>
        </nav>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}