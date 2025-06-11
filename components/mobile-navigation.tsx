"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import {
  Home,
  Calendar,
  BookOpen,
  BarChart2,
  User,
  Menu,
  X,
  Clock,
  Sparkles,
  CheckSquare,
  Users,
  Brain,
  Settings,
  LogOut,
} from "lucide-react"
import { useMobile } from "@/hooks/use-mobile"
import { auth } from "@/lib/firebase"

export function MobileNavigation() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const { isMobile } = useMobile()

  // Close menu when navigating
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  // Prevent scrolling when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "auto"
    }
    return () => {
      document.body.style.overflow = "auto"
    }
  }, [isOpen])

  if (!isMobile) return null

  const navItems = [
    { name: "Dashboard", href: "/", icon: <Home className="h-5 w-5" /> },
    { name: "Tasks", href: "/tasks", icon: <CheckSquare className="h-5 w-5" /> },
    { name: "Calendar", href: "/calendar", icon: <Calendar className="h-5 w-5" /> },
    { name: "Study Timer", href: "/timer", icon: <Clock className="h-5 w-5" /> },
    { name: "Flashcards", href: "/flashcards", icon: <BookOpen className="h-5 w-5" /> },
    { name: "AI Tools", href: "/ai", icon: <Sparkles className="h-5 w-5" /> },
    { name: "Study Rooms", href: "/rooms", icon: <Users className="h-5 w-5" /> },
    { name: "Analytics", href: "/analytics", icon: <BarChart2 className="h-5 w-5" /> },
    { name: "Profile", href: "/profile", icon: <User className="h-5 w-5" /> },
    { name: "Settings", href: "/settings", icon: <Settings className="h-5 w-5" /> },
  ]

  return (
    <>
      {/* Hamburger Menu Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-4 left-4 z-50 p-2 bg-white/10 backdrop-blur-lg rounded-full shadow-lg"
        aria-label="Open menu"
      >
        <Menu className="h-6 w-6 text-purple-600" />
      </button>

      {/* Sliding Side Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Side Menu */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed top-0 left-0 bottom-0 w-[280px] bg-white dark:bg-gray-900 z-50 shadow-xl overflow-y-auto"
            >
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
                  <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-r from-violet-600 to-purple-600 p-2 rounded-lg">
                      <Brain className="h-6 w-6 text-white" />
                    </div>
                    <h2 className="text-xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                      StudyHub Elite
                    </h2>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                    aria-label="Close menu"
                  >
                    <X className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  </button>
                </div>

                {/* Navigation Links */}
                <div className="flex-1 py-2">
                  {navItems.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center gap-3 px-4 py-3 text-base ${
                        pathname === item.href
                          ? "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 font-medium"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                      }`}
                    >
                      <div
                        className={`${
                          pathname === item.href
                            ? "text-purple-600 dark:text-purple-400"
                            : "text-gray-500 dark:text-gray-400"
                        }`}
                      >
                        {item.icon}
                      </div>
                      <span>{item.name}</span>
                    </Link>
                  ))}
                </div>

                {/* Footer */}
                <div className="border-t border-gray-200 dark:border-gray-800 p-4">
                  <button
                    onClick={() => auth.signOut()}
                    className="flex items-center gap-3 w-full px-4 py-3 text-base text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
