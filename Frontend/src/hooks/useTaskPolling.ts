import { useEffect, useRef } from 'react'

interface UsePollingOptions {
  interval?: number
  onFetch?: () => Promise<void>
}

/**
 * Custom hook for polling task updates
 * Automatically refetches tasks at specified interval
 */
export function useTaskPolling({ interval = 5000, onFetch }: UsePollingOptions) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!onFetch) return

    // Initial fetch
    onFetch()

    // Set up polling
    intervalRef.current = setInterval(() => {
      onFetch()
    }, interval)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [interval, onFetch])

  const stop = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
  }

  return { stop }
}
