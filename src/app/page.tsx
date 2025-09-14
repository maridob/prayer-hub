"use client"

import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import PrayerList from "@/components/PrayerList"

function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="font-montserrat text-4xl sm:text-5xl lg:text-6xl font-light text-primary mb-8 text-shadow">
              Prayer <span className="font-semibold">Ministry</span>
            </h1>
            <p className="text-xl lg:text-2xl text-secondary max-w-3xl mx-auto mb-12 leading-relaxed">
              A sacred digital space to share your prayers, connect with your faith community, and witness God's faithfulness in your spiritual journey.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link
                href="/auth/signup"
                className="hover-lift bg-primary text-white px-10 py-4 rounded-full font-medium text-lg hover:bg-opacity-90 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-primary/20"
              >
                Begin Your Journey
              </Link>
              <Link
                href="/auth/signin"
                className="hover-lift bg-white text-primary px-10 py-4 rounded-full font-medium text-lg border-2 border-primary hover:bg-muted transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-primary/20"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-montserrat text-3xl lg:text-4xl font-light text-primary mb-6">
              Nurture Your <span className="font-semibold">Spiritual Life</span>
            </h2>
            <p className="text-lg text-secondary max-w-2xl mx-auto">
              Experience a meaningful way to organize, track, and celebrate your prayer life with our thoughtfully designed platform.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="hover-lift bg-white rounded-2xl p-8 text-center shadow-sm border border-border/20">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="font-montserrat text-xl font-semibold text-primary mb-4">Prayer Journal</h3>
              <p className="text-secondary leading-relaxed">
                Create a personal, secure space to document your prayers and spiritual reflections throughout your journey.
              </p>
            </div>

            <div className="hover-lift bg-white rounded-2xl p-8 text-center shadow-sm border border-border/20">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-montserrat text-xl font-semibold text-primary mb-4">Answer Tracking</h3>
              <p className="text-secondary leading-relaxed">
                Mark prayers as answered and build a testimony of God's faithfulness and provision in your life.
              </p>
            </div>

            <div className="hover-lift bg-white rounded-2xl p-8 text-center shadow-sm border border-border/20">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="font-montserrat text-xl font-semibold text-primary mb-4">Private & Secure</h3>
              <p className="text-secondary leading-relaxed">
                Your prayers remain confidential and protected, creating a safe haven for intimate conversations with God.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="font-montserrat text-3xl lg:text-4xl font-light text-primary mb-6">
            Ready to Deepen Your <span className="font-semibold">Prayer Life?</span>
          </h2>
          <p className="text-lg text-secondary mb-8 leading-relaxed">
            Join our community and discover a meaningful way to organize and celebrate your spiritual journey.
          </p>
          <Link
            href="/auth/signup"
            className="hover-lift inline-block bg-primary text-white px-12 py-4 rounded-full font-medium text-lg hover:bg-opacity-90 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-primary/20"
          >
            Start Praying Today
          </Link>
        </div>
      </section>
    </div>
  )
}

function AuthenticatedHomePage({ session }: { session: any }) {
  return (
    <div className="min-h-screen bg-white">
      <header className="bg-white border-b border-border/20">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div>
            <h1 className="font-montserrat text-3xl font-light text-primary">
              Prayer <span className="font-semibold">Dashboard</span>
            </h1>
            <p className="text-secondary mt-1">Manage and track your spiritual journey</p>
          </div>
          <div className="flex items-center space-x-6">
            <div className="text-right">
              <p className="text-sm text-secondary">Welcome back,</p>
              <p className="font-medium text-primary">{session.user?.name || session.user?.email}</p>
            </div>
            <button
              onClick={() => signOut()}
              className="hover-lift bg-white text-primary px-6 py-2 rounded-full font-medium border-2 border-primary hover:bg-muted transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-primary/20"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <PrayerList />
      </main>
    </div>
  )
}

export default function Home() {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (session) {
    return <AuthenticatedHomePage session={session} />
  }

  return <LandingPage />
}
