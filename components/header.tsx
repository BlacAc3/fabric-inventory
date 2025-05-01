"use client"

import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import Link from "next/link"

interface HeaderProps {
  onAddNewClick: () => void
  currentPage?: "inventory" | "voice"
}

export default function Header({ onAddNewClick, currentPage = "inventory" }: HeaderProps) {
  const router = useRouter()
  const [scrolled, setScrolled] = useState(false)

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const navigateToVoice = () => {
    router.push("/")
  }

  const navigateToInventory = () => {
    router.push("/inventory")
  }

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all duration-300 ${
        scrolled ? "bg-white/90 backdrop-blur-md shadow-sm" : "bg-white"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center shadow-sm">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-5 h-5 text-white"
              >
                <path d="M15 2H9a1 1 0 0 0-1 1v2c0 .6.4 1 1 1h6c.6 0 1-.4 1-1V3c0-.6-.4-1-1-1Z" />
                <path d="M8 4H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1h-2" />
                <path d="M9 12h6" />
                <path d="M9 16h6" />
                <path d="M9 8h6" />
              </svg>
            </div>
            <Link href={currentPage === "inventory" ? "/inventory" : "/"} className="flex items-center">
              <h1 className="text-xl font-semibold text-neutral-800 tracking-tight">
                Fabric<span className="text-primary-600">Inventory</span>
              </h1>
            </Link>
          </div>

          <nav className="hidden md:flex items-center space-x-1">
            <Link
              href="/"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                currentPage === "voice"
                  ? "text-primary-700 bg-primary-50"
                  : "text-neutral-600 hover:text-primary-600 hover:bg-neutral-50"
              }`}
            >
              <div className="flex items-center space-x-1.5">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-4 h-4"
                >
                  <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  <line x1="12" x2="12" y1="19" y2="22" />
                </svg>
                <span>Voice Assistant</span>
              </div>
            </Link>
            <Link
              href="/inventory"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                currentPage === "inventory"
                  ? "text-primary-700 bg-primary-50"
                  : "text-neutral-600 hover:text-primary-600 hover:bg-neutral-50"
              }`}
            >
              <div className="flex items-center space-x-1.5">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-4 h-4"
                >
                  <path d="M20 6v12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V8.5a2 2 0 0 1 2-2h4.586a1 1 0 0 1 .707.293L15 8.5a1 1 0 0 1 .293.707V9h2a2 2 0 0 1 2 2v-5Z" />
                  <path d="M8 6V4a2 2 0 0 1 2-2h4.586a1 1 0 0 1 .707.293L17 4a1 1 0 0 1 .293.707V6" />
                </svg>
                <span>Inventory</span>
              </div>
            </Link>
          </nav>

          <div className="flex items-center space-x-3">
            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                className="btn btn-sm btn-secondary"
                onClick={() => (currentPage === "inventory" ? navigateToVoice() : navigateToInventory())}
              >
                {currentPage === "inventory" ? (
                  <div className="flex items-center space-x-1.5">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-4 h-4"
                    >
                      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                      <line x1="12" x2="12" y1="19" y2="22" />
                    </svg>
                    <span>Voice</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-1.5">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-4 h-4"
                    >
                      <path d="M20 6v12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V8.5a2 2 0 0 1 2-2h4.586a1 1 0 0 1 .707.293L15 8.5a1 1 0 0 1 .293.707V9h2a2 2 0 0 1 2 2v-5Z" />
                      <path d="M8 6V4a2 2 0 0 1 2-2h4.586a1 1 0 0 1 .707.293L17 4a1 1 0 0 1 .293.707V6" />
                    </svg>
                    <span>Inventory</span>
                  </div>
                )}
              </button>
            </div>

            {currentPage === "inventory" && (
              <button onClick={onAddNewClick} className="btn btn-primary btn-md">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-4 h-4 mr-1.5"
                >
                  <path d="M12 5v14" />
                  <path d="M5 12h14" />
                </svg>
                <span>Add Fabric</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
