import { useEffect, useRef, useState } from 'react'

export function useTimer() {
  const [seconds, setSeconds] = useState(0)
  const [running, setRunning] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | undefined>(
    undefined,
  )

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => setSeconds((s) => s + 1), 1000)
    } else {
      clearInterval(intervalRef.current)
    }
    return () => clearInterval(intervalRef.current)
  }, [running])

  const toggle = () => setRunning((r) => !r)
  const reset = () => {
    setRunning(false)
    setSeconds(0)
  }
  const startWithMinutes = (minutes: number) => {
    setSeconds(minutes * 60)
    setRunning(false)
  }

  return { seconds, running, toggle, reset, startWithMinutes, setRunning }
}
