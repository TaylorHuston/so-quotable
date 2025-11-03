import { UserProfile } from "@/components/UserProfile";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>
        <UserProfile />
        <div className="mt-8 p-6 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Protected Content</h2>
          <p className="text-gray-600">
            This is a protected route. Only authenticated users can see this page.
          </p>
        </div>
      </div>
    </div>
  );
}
