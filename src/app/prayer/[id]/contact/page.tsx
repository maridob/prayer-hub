"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Link from "next/link"

interface Prayer {
  id: string
  title: string
  content: string
  isAnswered: boolean
  isPrivate: boolean
  isContactPetitioner?: string
  petitioner?: string
  petitionerContactEmail?: string
  petitionerContactPhone?: string
  hosannaLocation?: string
  createdAt: string
  user: {
    name?: string
    email: string
  }
}

export default function PrayerContactPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session, status } = useSession()
  const [prayer, setPrayer] = useState<Prayer | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "loading") return
    if (!session) {
      router.push("/auth/signin")
      return
    }

    fetchPrayer()
  }, [session, status, params.id])

  const fetchPrayer = async () => {
    try {
      const response = await fetch(`/api/prayers/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setPrayer(data)
      } else if (response.status === 404) {
        router.push("/")
      }
    } catch (error) {
      console.error("Error fetching prayer:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    })
  }

  const generateEmailSubject = () => {
    return `Prayer Response for ${prayer?.petitioner || 'Your Prayer Request'}`
  }

  const generateEmailBody = () => {
    return `Dear ${prayer?.petitioner || 'Friend'},

I wanted to reach out to let you know that I have been praying for your request:

"${prayer?.content}"

I hope this message finds you well and that you are experiencing God's peace and comfort during this time.

Please know that you are in my thoughts and prayers. If there's anything specific you'd like me to continue praying for, or if you have any updates you'd like to share, please feel free to let me know.

May God bless you abundantly.

With Christian love and prayers,
${session?.user?.name || 'A Fellow Believer'}

---
Sent from Hosanna Prayer Ministry
${prayer?.hosannaLocation || ''}`
  }

  const handleEmailContact = () => {
    const subject = encodeURIComponent(generateEmailSubject())
    const body = encodeURIComponent(generateEmailBody())
    const to = prayer?.petitionerContactEmail || ''

    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${to}&su=${subject}&body=${body}`
    window.open(gmailUrl, '_blank')
  }

  const getContactPreferenceEmoji = (preference?: string) => {
    if (!preference) return '📞'

    const pref = preference.toLowerCase()
    if (pref.includes('email') || pref.includes('e-mail')) {
      return '📧'
    } else if (pref.includes('phone') || pref.includes('call') || pref.includes('telephone')) {
      return '📞'
    } else if (pref.includes('text') || pref.includes('sms')) {
      return '💬'
    } else if (pref.includes('both') || pref.includes('either')) {
      return '📧📞'
    }
    return '📞' // Default to phone emoji if unknown preference
  }

  const handlePhoneContact = () => {
    if (prayer?.petitionerContactPhone) {
      const phoneNumber = prayer.petitionerContactPhone.replace(/\D/g, '')
      window.open(`tel:${phoneNumber}`)
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-lg text-secondary">Loading prayer details...</div>
      </div>
    )
  }

  if (!session || !prayer) {
    return null
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-white border-b border-border/20">
        <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-secondary hover:text-primary transition-colors duration-300 mb-4"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Prayers
          </Link>
          <h1 className="font-montserrat text-3xl font-light text-primary">
            Prayer <span className="font-semibold">Contact</span>
          </h1>
          <p className="text-secondary mt-1">Choose how you'd like to pray for and contact the petitioner</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Prayer Details */}
        <div className="bg-muted rounded-2xl p-8 mb-8 border border-border/10">
          <div className="flex flex-wrap gap-3 mb-4">
            <span
              className={`px-4 py-2 text-sm font-medium rounded-full ${
                prayer.isAnswered
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-yellow-50 text-yellow-700 border border-yellow-200"
              }`}
            >
              {prayer.isAnswered ? "✓ Answered" : "⏱ Pending"}
            </span>
            {prayer.isContactPetitioner && (
              <span className="px-4 py-2 text-sm font-medium rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                {getContactPreferenceEmoji(prayer.isContactPetitioner)} {prayer.isContactPetitioner}
              </span>
            )}
          </div>

          <h2 className="font-montserrat text-xl font-semibold text-primary mb-4">
            {prayer.title}
          </h2>

          <p className="text-primary leading-relaxed mb-6 text-lg">
            {prayer.content}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-border/20">
            {prayer.petitioner && (
              <div>
                <span className="text-sm font-semibold text-primary block mb-1">Petitioner</span>
                <p className="text-secondary text-lg">{prayer.petitioner}</p>
              </div>
            )}
            <div>
              <span className="text-sm font-semibold text-primary block mb-1">Submitted</span>
              <p className="text-secondary">{formatDate(prayer.createdAt)}</p>
            </div>
            {prayer.petitionerContactEmail && (
              <div>
                <span className="text-sm font-semibold text-primary block mb-1">Email</span>
                <p className="text-secondary">{prayer.petitionerContactEmail}</p>
              </div>
            )}
            {prayer.petitionerContactPhone && (
              <div>
                <span className="text-sm font-semibold text-primary block mb-1">Phone</span>
                <p className="text-secondary">{prayer.petitionerContactPhone}</p>
              </div>
            )}
            {prayer.hosannaLocation && (
              <div>
                <span className="text-sm font-semibold text-primary block mb-1">Hosanna Location</span>
                <p className="text-secondary">{prayer.hosannaLocation}</p>
              </div>
            )}
          </div>
        </div>

        {/* Contact Options */}
        <div className="space-y-6">
          <h2 className="font-montserrat text-2xl font-semibold text-primary mb-6">
            How would you like to reach out?
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Email Option */}
            {prayer.petitionerContactEmail && (
              <div className="hover-lift bg-white rounded-2xl p-8 border border-border/10 shadow-sm">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="font-montserrat text-xl font-semibold text-primary text-center mb-4">
                  Send Email
                </h3>
                <p className="text-secondary text-center mb-6 leading-relaxed">
                  Send a pre-filled compassionate email through Gmail to let them know you're praying for them.
                </p>
                <button
                  onClick={handleEmailContact}
                  className="w-full hover-lift bg-primary text-white py-3 px-6 rounded-full font-medium hover:bg-opacity-90 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-primary/20"
                >
                  Open Gmail with Template
                </button>
              </div>
            )}

            {/* Phone Option */}
            {prayer.petitionerContactPhone && (
              <div className="hover-lift bg-white rounded-2xl p-8 border border-border/10 shadow-sm">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <h3 className="font-montserrat text-xl font-semibold text-primary text-center mb-4">
                  Make a Call
                </h3>
                <p className="text-secondary text-center mb-6 leading-relaxed">
                  Call {prayer.petitioner} directly to offer personal prayer support and encouragement.
                </p>
                <button
                  onClick={handlePhoneContact}
                  className="w-full hover-lift bg-white text-primary py-3 px-6 rounded-full font-medium border-2 border-primary hover:bg-muted transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-primary/20"
                >
                  Call {prayer.petitionerContactPhone}
                </button>
              </div>
            )}

            {/* No Contact Info */}
            {!prayer.petitionerContactEmail && !prayer.petitionerContactPhone && (
              <div className="lg:col-span-2">
                <div className="bg-yellow-50 rounded-2xl p-8 border border-yellow-200 text-center">
                  <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <h3 className="font-montserrat text-xl font-semibold text-yellow-800 mb-2">
                    No Contact Information Available
                  </h3>
                  <p className="text-yellow-700">
                    This prayer request doesn't include contact information, but you can still continue praying for {prayer.petitioner || 'this person'}.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Prayer Commitment */}
          <div className="bg-white rounded-2xl p-8 border border-border/10 shadow-sm text-center mt-8">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h3 className="font-montserrat text-xl font-semibold text-primary mb-4">
              Continue in Prayer
            </h3>
            <p className="text-secondary mb-6 leading-relaxed max-w-2xl mx-auto">
              Remember to continue lifting up {prayer.petitioner || 'this person'} in your daily prayers.
              Your faithful intercession makes a difference in their life and spiritual journey.
            </p>
            <p className="text-sm text-primary font-medium italic">
              "Therefore confess your sins to each other and pray for each other so that you may be healed.
              The prayer of a righteous person is powerful and effective." - James 5:16
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}