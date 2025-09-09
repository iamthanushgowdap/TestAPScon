
"use client"
import { useState, useEffect } from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkDevice = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }

    // Run the check once after the component has mounted on the client
    checkDevice();
    
    // Add event listener for window resize
    window.addEventListener('resize', checkDevice);

    // Cleanup listener on component unmount
    return () => {
      window.removeEventListener('resize', checkDevice)
    }
  }, []);

  return isMobile
}
