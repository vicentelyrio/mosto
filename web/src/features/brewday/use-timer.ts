import { useEffect, useRef, useState } from 'react'

export function useTimer() {
  const [targetSeconds, setTargetSeconds] = useState(0)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [running, setRunning] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | undefined>(
    undefined,
  )

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(
        () => setElapsedSeconds((s) => s + 1),
        1000,
      )
    } else {
      clearInterval(intervalRef.current)
    }
    return () => clearInterval(intervalRef.current)
  }, [running])

  const remainingSeconds = targetSeconds - elapsedSeconds
  const isOvertime = remainingSeconds < 0
  const displaySeconds = Math.abs(remainingSeconds)

  const toggle = () => setRunning((r) => !r)
  const reset = () => {
    setRunning(false)
    setElapsedSeconds(0)
    setTargetSeconds(0)
  }
  const startWithMinutes = (minutes: number) => {
    setTargetSeconds(minutes * 60)
    setElapsedSeconds(0)
    setRunning(false)
  }
  const addMinutes = (minutes: number) => {
    setTargetSeconds((t) => t + minutes * 60)
  }

  return {
    targetSeconds,
    elapsedSeconds,
    remainingSeconds,
    displaySeconds,
    isOvertime,
    running,
    toggle,
    reset,
    startWithMinutes,
    addMinutes,
    setRunning,
  }
}
