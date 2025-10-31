export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <main className="max-w-4xl mx-auto px-6 py-12 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">So Quoteable</h1>
        <p className="text-xl text-gray-700 mb-8">
          Generate beautiful quote images with verified sources and proper
          attribution
        </p>
        <div className="bg-white rounded-lg shadow-xl p-8 mb-8">
          <p className="text-gray-600 italic text-lg">
            &quot;The only way to do great work is to love what you do.&quot;
          </p>
          <p className="text-gray-500 mt-4">— Steve Jobs</p>
        </div>
        <div className="text-sm text-gray-600">
          <p>Infrastructure setup in progress...</p>
          <p className="mt-2">Check back soon for the full application!</p>
        </div>
      </main>
    </div>
  );
}
