"use client"

import { useState, useEffect } from "react"

export function useMobile() {
  const [isMobile, setIsMobile] = useState(false)
  const [isTablet, setIsTablet] = useState(false)
  const [isLandscape, setIsLandscape] = useState(false)

  useEffect(() => {
    const checkDevice = () => {
      const mobile = window.innerWidth < 640
      const tablet = window.innerWidth >= 640 && window.innerWidth < 1024
      const landscape = window.innerWidth > window.innerHeight

      setIsMobile(mobile)
      setIsTablet(tablet)
      setIsLandscape(landscape)
    }

    // Initial check
    checkDevice()

    // Add event listener for window resize
    window.addEventListener("resize", checkDevice)
    window.addEventListener("orientationchange", checkDevice)

    // Cleanup
    return () => {
      window.removeEventListener("resize", checkDevice)
      window.removeEventListener("orientationchange", checkDevice)
    }
  }, [])

  return { isMobile, isTablet, isLandscape }
}
