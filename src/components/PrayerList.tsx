"use client"

import { useState, useEffect } from "react"
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
  updatedAt: string
  user: {
    name?: string
    email: string
  }
}

interface PrayerFilters {
  status: "all" | "answered" | "unanswered"
  dateFrom: string
  dateTo: string
  teamMember: string
}

export default function PrayerList() {
  const [prayers, setPrayers] = useState<Prayer[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [syncStatus, setSyncStatus] = useState<{
    configured: boolean
    connected: boolean
    message?: string
  } | null>(null)
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    hasNextPage: false,
    hasPrevPage: false,
    limit: 10
  })
  const [filters, setFilters] = useState<PrayerFilters>({
    status: "all",
    dateFrom: "",
    dateTo: "",
    teamMember: ""
  })

  const fetchPrayers = async (page = 1) => {
    try {
      setLoading(true)
      const searchParams = new URLSearchParams()

      if (filters.status !== "all") {
        searchParams.set("status", filters.status)
      }
      if (filters.dateFrom) {
        searchParams.set("dateFrom", filters.dateFrom)
      }
      if (filters.dateTo) {
        searchParams.set("dateTo", filters.dateTo)
      }
      if (filters.teamMember) {
        searchParams.set("teamMember", filters.teamMember)
      }

      searchParams.set("page", page.toString())
      searchParams.set("limit", pagination.limit.toString())

      const response = await fetch(`/api/prayers?${searchParams.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setPrayers(data.prayers)
        setPagination(data.pagination)
      } else {
        console.error("Failed to fetch prayers")
      }
    } catch (error) {
      console.error("Error fetching prayers:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPrayers()
    checkSyncStatus()
  }, [filters])

  const checkSyncStatus = async () => {
    try {
      const response = await fetch("/api/prayers/sync")
      if (response.ok) {
        const status = await response.json()
        setSyncStatus(status)
      }
    } catch (error) {
      console.error("Error checking sync status:", error)
    }
  }

  const handleSync = async () => {
    try {
      setSyncing(true)
      const response = await fetch("/api/prayers/sync", {
        method: "POST"
      })

      if (response.ok) {
        const result = await response.json()
        alert(`Sync completed!\nImported: ${result.imported} prayers\nSkipped: ${result.skipped} prayers\nTotal processed: ${result.total} prayers`)
        // Refresh the prayer list after sync
        await fetchPrayers()
      } else {
        const error = await response.json()
        alert(`Sync failed: ${error.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error("Error syncing prayers:", error)
      alert("Sync failed: Network error")
    } finally {
      setSyncing(false)
    }
  }

  const handleFilterChange = (key: keyof PrayerFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setPagination(prev => ({ ...prev, currentPage: 1 })) // Reset to first page when filtering
  }

  const handlePageChange = (newPage: number) => {
    fetchPrayers(newPage)
  }

  const handleMarkAnswered = async (prayerId: string) => {
    try {
      const response = await fetch(`/api/prayers/${prayerId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          isAnswered: true
        })
      })

      if (response.ok) {
        // Refresh the prayer list to show the updated status
        fetchPrayers(pagination.currentPage)
      } else {
        alert("Failed to update prayer status")
      }
    } catch (error) {
      console.error("Error updating prayer status:", error)
      alert("Error updating prayer status")
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    })
  }

  const getContactPreferenceEmoji = (preference?: string) => {
    if (!preference) return null

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

  return (
    <div className="space-y-8">
      {/* Filters */}
      <div className="bg-muted rounded-2xl p-8 border border-border/10">
        <h3 className="font-montserrat text-xl font-semibold text-primary mb-6">Filter Your Prayers</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-primary mb-2">
              Prayer Status
            </label>
            <select
              id="status"
              value={filters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
              className="w-full px-4 py-3 border border-border rounded-xl bg-white focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all duration-300"
            >
              <option value="all">All Prayers</option>
              <option value="answered">Answered</option>
              <option value="unanswered">Unanswered</option>
            </select>
          </div>

          <div>
            <label htmlFor="dateFrom" className="block text-sm font-medium text-primary mb-2">
              Date From
            </label>
            <input
              type="date"
              id="dateFrom"
              value={filters.dateFrom}
              onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
              className="w-full px-4 py-3 border border-border rounded-xl bg-white focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all duration-300"
            />
          </div>

          <div>
            <label htmlFor="dateTo" className="block text-sm font-medium text-primary mb-2">
              Date To
            </label>
            <input
              type="date"
              id="dateTo"
              value={filters.dateTo}
              onChange={(e) => handleFilterChange("dateTo", e.target.value)}
              className="w-full px-4 py-3 border border-border rounded-xl bg-white focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all duration-300"
            />
          </div>

          <div>
            <label htmlFor="teamMember" className="block text-sm font-medium text-primary mb-2">
              Team Member
            </label>
            <input
              type="text"
              id="teamMember"
              value={filters.teamMember}
              onChange={(e) => handleFilterChange("teamMember", e.target.value)}
              placeholder="Search by petitioner name"
              className="w-full px-4 py-3 border border-border rounded-xl bg-white focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all duration-300"
            />
          </div>
        </div>
      </div>

      {/* Sync Section */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-white rounded-2xl p-6 border border-border/10 shadow-sm">
        <div className="flex-1">
          <h3 className="font-montserrat text-lg font-semibold text-primary mb-2">
            Google Sheets Sync
          </h3>
          <p className="text-secondary text-sm">
            Import prayer requests from your Google Sheets spreadsheet
          </p>
          {syncStatus && (
            <div className="mt-2">
              {syncStatus.configured ? (
                syncStatus.connected ? (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-green-700">
                      Connected - {syncStatus.availablePrayers || 0} prayers available
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span className="text-sm text-red-700">Connection failed</span>
                  </div>
                )
              ) : (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm text-yellow-700">API key not configured</span>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="flex gap-3">
          <button
            onClick={checkSyncStatus}
            disabled={syncing}
            className="hover-lift bg-white text-primary px-4 py-2 rounded-full font-medium border-2 border-primary hover:bg-muted transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Check Status
          </button>
          <button
            onClick={handleSync}
            disabled={syncing || !syncStatus?.configured || !syncStatus?.connected}
            className="hover-lift bg-primary text-white px-6 py-2 rounded-full font-medium hover:bg-opacity-90 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-primary/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {syncing ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Syncing...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Sync Now
              </>
            )}
          </button>
        </div>
      </div>

      {/* Prayer List */}
      <div>
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="text-lg text-secondary">Loading prayers...</div>
          </div>
        ) : prayers.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-border/10 shadow-sm">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="font-montserrat text-xl font-semibold text-primary mb-2">No prayers found</h3>
            <p className="text-secondary">Try adjusting your filters to see more prayer requests.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {prayers.map((prayer) => (
              <div key={prayer.id} className="hover-lift bg-white rounded-2xl p-8 border border-border/10 shadow-sm">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex-1">
                    <h3 className="font-montserrat text-xl font-semibold text-primary mb-3">
                      {prayer.title}
                    </h3>
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
                      {prayer.isPrivate && (
                        <span className="px-4 py-2 text-sm font-medium rounded-full bg-primary/5 text-primary border border-primary/20">
                          🔒 Private
                        </span>
                      )}
                      {prayer.isContactPetitioner && (
                        <span className="px-4 py-2 text-sm font-medium rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                          {getContactPreferenceEmoji(prayer.isContactPetitioner)} {prayer.isContactPetitioner}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-sm text-secondary font-medium">
                    {formatDate(prayer.createdAt)}
                  </div>
                </div>

                <p className="text-primary leading-relaxed mb-6">{prayer.content}</p>

                {/* Prayer Actions */}
                <div className="flex flex-wrap gap-3 mb-6">
                  <Link
                    href={`/prayer/${prayer.id}/contact`}
                    className="hover-lift bg-primary text-white px-6 py-2 rounded-full font-medium text-sm hover:bg-opacity-90 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-primary/20 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    Pray & Contact
                  </Link>

                  {!prayer.isAnswered && (
                    <button
                      onClick={() => handleMarkAnswered(prayer.id)}
                      className="hover-lift bg-green-50 text-green-700 px-6 py-2 rounded-full font-medium text-sm border border-green-200 hover:bg-green-100 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-green-100 flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Mark as Answered
                    </button>
                  )}
                </div>

                {/* Prayer Details */}
                {(prayer.petitioner || prayer.petitionerContactEmail || prayer.petitionerContactPhone || prayer.hosannaLocation) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-border/20">
                    {prayer.petitioner && (
                      <div>
                        <span className="text-sm font-semibold text-primary block mb-1">Petitioner</span>
                        <p className="text-secondary">{prayer.petitioner}</p>
                      </div>
                    )}
                    {prayer.petitionerContactEmail && (
                      <div>
                        <span className="text-sm font-semibold text-primary block mb-1">Contact Email</span>
                        <p className="text-secondary">{prayer.petitionerContactEmail}</p>
                      </div>
                    )}
                    {prayer.petitionerContactPhone && (
                      <div>
                        <span className="text-sm font-semibold text-primary block mb-1">Contact Phone</span>
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
                )}
              </div>
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        {!loading && prayers.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-2xl p-6 border border-border/10 shadow-sm mt-6">
            <div className="text-sm text-secondary">
              Showing {((pagination.currentPage - 1) * pagination.limit) + 1} to{' '}
              {Math.min(pagination.currentPage * pagination.limit, pagination.totalCount)} of{' '}
              {pagination.totalCount} prayers
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={!pagination.hasPrevPage}
                className="hover-lift px-4 py-2 text-sm font-medium text-primary border-2 border-primary rounded-full hover:bg-muted transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
              >
                Previous
              </button>

              {/* Page numbers */}
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  const startPage = Math.max(1, pagination.currentPage - 2)
                  const pageNumber = startPage + i

                  if (pageNumber > pagination.totalPages) return null

                  return (
                    <button
                      key={pageNumber}
                      onClick={() => handlePageChange(pageNumber)}
                      className={`hover-lift w-10 h-10 text-sm font-medium rounded-full transition-all duration-300 ${
                        pageNumber === pagination.currentPage
                          ? 'bg-primary text-white'
                          : 'text-primary hover:bg-muted border border-border'
                      }`}
                    >
                      {pageNumber}
                    </button>
                  )
                })}
              </div>

              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={!pagination.hasNextPage}
                className="hover-lift px-4 py-2 text-sm font-medium text-primary border-2 border-primary rounded-full hover:bg-muted transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}