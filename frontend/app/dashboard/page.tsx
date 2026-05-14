import { Card, CardContent } from "@/components/ui/card";

export default function DashboardPage() {
  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold mb-8">
        Dashboard
      </h1>

      <div className="grid grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold">
              Documents
            </h2>

            <p className="text-3xl mt-4 font-bold">
              12
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold">
              Questions Asked
            </h2>

            <p className="text-3xl mt-4 font-bold">
              84
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold">
              Plan
            </h2>

            <p className="text-3xl mt-4 font-bold">
              Free
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}