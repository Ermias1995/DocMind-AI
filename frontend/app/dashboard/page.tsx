export default function DashboardPage() {
  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold mb-6">
        Dashboard
      </h1>

      <div className="grid grid-cols-3 gap-6">
        <div className="border rounded-xl p-6">
          <h2 className="text-xl font-semibold">
            Documents
          </h2>

          <p className="text-3xl mt-4 font-bold">
            0
          </p>
        </div>

        <div className="border rounded-xl p-6">
          <h2 className="text-xl font-semibold">
            Questions
          </h2>

          <p className="text-3xl mt-4 font-bold">
            0
          </p>
        </div>

        <div className="border rounded-xl p-6">
          <h2 className="text-xl font-semibold">
            Plan
          </h2>

          <p className="text-3xl mt-4 font-bold">
            Free
          </p>
        </div>
      </div>
    </div>
  );
}