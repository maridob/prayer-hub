import Link from "next/link"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
          Prayer Website
        </h1>
        <p className="text-xl md:text-2xl text-gray-600 mb-8">
          A sacred space to share your prayers and connect with your faith
        </p>
        <p className="text-lg text-gray-500 mb-12 max-w-2xl mx-auto">
          Keep track of your prayer requests, mark answered prayers, and build a personal journal of your spiritual journey.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/auth/signup"
            className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Get Started
          </Link>
          <Link
            href="/auth/signin"
            className="bg-white text-indigo-600 px-8 py-3 rounded-lg font-semibold border border-indigo-600 hover:bg-indigo-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Sign In
          </Link>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Personal Prayer Journal</h3>
            <p className="text-gray-600">Keep track of your prayers and spiritual journey in a private, secure space.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Answer Tracking</h3>
            <p className="text-gray-600">Mark prayers as answered and celebrate God's faithfulness in your life.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Private & Secure</h3>
            <p className="text-gray-600">Your prayers remain private and secure, visible only to you and God.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
