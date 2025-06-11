"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, Home, CheckSquare, Calendar, Clock, BookOpen, Brain, Sparkles, User, LogOut } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"
import { signOut } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { useToast } from "@/hooks/use-toast"
import { ThemeToggle } from "./theme-toggle"

interface MobileNavigationProps {
  user: any
}

export function MobileNavigation({ user }: MobileNavigationProps) {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const { toast } = useToast()

  const handleSignOut = async () => {
    try {
      await signOut(auth)
      toast({
        title: "Signed out successfully",
        description: "You have been signed out of your account.",
      })
      router.push("/")
    } catch (error) {
      console.error("Sign out error:", error)
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      })
    }
  }

  const navigationItems = [
    { href: "/", label: "Dashboard", icon: Home },
    { href: "/tasks", label: "Tasks", icon: CheckSquare },
    { href: "/calendar", label: "Calendar", icon: Calendar },
    { href: "/timer", label: "Timer", icon: Clock },
    { href: "/flashcards", label: "Flashcards", icon: BookOpen },
    { href: "/assistant", label: "AI Assistant", icon: Brain },
    { href: "/ai-tools", label: "AI Tools", icon: Sparkles },
  ]

  const handleNavigation = (href: string) => {
    router.push(href)
    setIsOpen(false)
  }

  return (
    <div className="md:hidden">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent
          side="left"
          className="w-[280px] sm:w-[300px] p-0 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800"
        >
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500 rounded-lg">
                    <Brain className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="font-bold text-lg text-gray-900 dark:text-white">StudyHub Elite</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Welcome, {user?.displayName?.split(" ")[0] || "Student"}
                    </p>
                  </div>
                </div>
                <ThemeToggle />
              </div>
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto py-4">
              <nav className="space-y-2 px-4">
                {navigationItems.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href

                  return (
                    <Button
                      key={item.href}
                      variant={isActive ? "default" : "ghost"}
                      className={`w-full justify-start h-12 px-4 text-left ${
                        isActive
                          ? "bg-blue-500 text-white hover:bg-blue-600"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                      }`}
                      onClick={() => handleNavigation(item.href)}
                    >
                      <Icon className="h-5 w-5 mr-3 flex-shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </Button>
                  )
                })}
              </nav>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-800">
              <div className="space-y-2">
                <Button
                  variant="ghost"
                  className="w-full justify-start h-12 px-4 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  onClick={() => handleNavigation("/profile")}
                >
                  <User className="h-5 w-5 mr-3 flex-shrink-0" />
                  <span className="truncate">Profile</span>
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start h-12 px-4 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                  onClick={handleSignOut}
                >
                  <LogOut className="h-5 w-5 mr-3 flex-shrink-0" />
                  <span className="truncate">Sign Out</span>
                </Button>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
