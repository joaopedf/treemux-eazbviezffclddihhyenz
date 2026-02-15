export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Micro-Task Marketplace API
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Connect task requesters with skilled providers in your local area
          </p>

          <div className="grid md:grid-cols-3 gap-8 mt-12">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold mb-2">Smart Matching</h3>
              <p className="text-gray-600">
                AI-powered algorithm matches tasks with the best providers based on skills, location, and reputation
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-4xl mb-4">⭐</div>
              <h3 className="text-xl font-semibold mb-2">Reputation System</h3>
              <p className="text-gray-600">
                Build trust with ratings and reviews from completed tasks
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-4xl mb-4">💳</div>
              <h3 className="text-xl font-semibold mb-2">Secure Payments</h3>
              <p className="text-gray-600">
                Integrated Stripe payments for safe and flexible transactions
              </p>
            </div>
          </div>

          <div className="mt-16 bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-3xl font-bold mb-6">API Endpoints</h2>

            <div className="space-y-4 text-left">
              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="font-semibold text-lg">Authentication</h3>
                <ul className="mt-2 space-y-1 text-gray-600">
                  <li><code className="bg-gray-100 px-2 py-1 rounded">POST /api/auth/register</code> - Register new user</li>
                  <li><code className="bg-gray-100 px-2 py-1 rounded">POST /api/auth/login</code> - Login user</li>
                </ul>
              </div>

              <div className="border-l-4 border-green-500 pl-4">
                <h3 className="font-semibold text-lg">Tasks</h3>
                <ul className="mt-2 space-y-1 text-gray-600">
                  <li><code className="bg-gray-100 px-2 py-1 rounded">GET /api/tasks</code> - List tasks with filters</li>
                  <li><code className="bg-gray-100 px-2 py-1 rounded">POST /api/tasks</code> - Create new task</li>
                  <li><code className="bg-gray-100 px-2 py-1 rounded">GET /api/tasks/[id]</code> - Get task details</li>
                  <li><code className="bg-gray-100 px-2 py-1 rounded">PATCH /api/tasks/[id]</code> - Update task status</li>
                  <li><code className="bg-gray-100 px-2 py-1 rounded">DELETE /api/tasks/[id]</code> - Cancel task</li>
                </ul>
              </div>

              <div className="border-l-4 border-purple-500 pl-4">
                <h3 className="font-semibold text-lg">Users</h3>
                <ul className="mt-2 space-y-1 text-gray-600">
                  <li><code className="bg-gray-100 px-2 py-1 rounded">GET /api/users/me</code> - Get current user profile</li>
                  <li><code className="bg-gray-100 px-2 py-1 rounded">PATCH /api/users/me</code> - Update profile</li>
                  <li><code className="bg-gray-100 px-2 py-1 rounded">GET /api/users/me/tasks</code> - Get user&apos;s tasks</li>
                </ul>
              </div>

              <div className="border-l-4 border-yellow-500 pl-4">
                <h3 className="font-semibold text-lg">Reviews & Reputation</h3>
                <ul className="mt-2 space-y-1 text-gray-600">
                  <li><code className="bg-gray-100 px-2 py-1 rounded">POST /api/reviews</code> - Create review</li>
                  <li><code className="bg-gray-100 px-2 py-1 rounded">GET /api/reviews?userId=xxx</code> - Get user reviews</li>
                </ul>
              </div>

              <div className="border-l-4 border-red-500 pl-4">
                <h3 className="font-semibold text-lg">AI Matching</h3>
                <ul className="mt-2 space-y-1 text-gray-600">
                  <li><code className="bg-gray-100 px-2 py-1 rounded">GET /api/matching/recommendations</code> - Get personalized tasks</li>
                  <li><code className="bg-gray-100 px-2 py-1 rounded">POST /api/matching/providers</code> - Find matching providers</li>
                </ul>
              </div>

              <div className="border-l-4 border-indigo-500 pl-4">
                <h3 className="font-semibold text-lg">Payments</h3>
                <ul className="mt-2 space-y-1 text-gray-600">
                  <li><code className="bg-gray-100 px-2 py-1 rounded">POST /api/payments/create-intent</code> - Create payment</li>
                  <li><code className="bg-gray-100 px-2 py-1 rounded">POST /api/payments/webhook</code> - Stripe webhooks</li>
                </ul>
              </div>

              <div className="border-l-4 border-pink-500 pl-4">
                <h3 className="font-semibold text-lg">Notifications</h3>
                <ul className="mt-2 space-y-1 text-gray-600">
                  <li><code className="bg-gray-100 px-2 py-1 rounded">GET /api/notifications</code> - Get user notifications</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-8 p-6 bg-blue-50 rounded-lg">
            <h3 className="text-xl font-semibold mb-2">Features</h3>
            <ul className="text-left space-y-2 text-gray-700">
              <li>✅ JWT-based authentication with secure password hashing</li>
              <li>✅ Comprehensive task management (CRUD operations)</li>
              <li>✅ Location-based task filtering with distance calculations</li>
              <li>✅ Star rating and review system with automatic reputation updates</li>
              <li>✅ ML-powered matching algorithm (skills, location, reputation, experience)</li>
              <li>✅ Personalized task recommendations for users</li>
              <li>✅ Smart provider matching for tasks</li>
              <li>✅ Stripe payment integration with webhook support</li>
              <li>✅ Real-time notification system</li>
              <li>✅ Task history tracking for ML learning</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
