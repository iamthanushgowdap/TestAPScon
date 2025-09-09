
"use client"
import { useState, useEffect } from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // This effect runs only on the client, after the initial render.
    const checkDevice = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }

    checkDevice(); // Check on mount
    
    window.addEventListener('resize', checkDevice)

    // Cleanup listener on component unmount
    return () => {
      window.removeEventListener('resize', checkDevice)
    }
  }, []) // Empty dependency array ensures this effect runs only once on the client.

  return isMobile
}
