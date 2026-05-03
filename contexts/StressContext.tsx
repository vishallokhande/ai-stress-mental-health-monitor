import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface JournalEntry {
  id: string
  timestamp: number
  mood: MoodTag
  stressLevel: number
  note: string
  tags: string[]
}

export type MoodTag = 'calm' | 'happy' | 'anxious' | 'stressed' | 'sad' | 'angry' | 'tired' | 'focused'

export interface StressReading {
  timestamp: number
  heartRate: number
  hrv: number
  stressScore: number
}

export interface DailyTrend {
  hour: number
  label: string
  stressScore: number
}

interface StressContextValue {
  // Real-time data
  heartRate: number
  hrv: number
  stressScore: number
  stressLevel: 'low' | 'moderate' | 'high' | 'very_high'

  // History
  readings: StressReading[]
  dailyTrend: DailyTrend[]
  weeklyAverage: number

  // Journal
  journalEntries: JournalEntry[]
  addJournalEntry: (entry: Omit<JournalEntry, 'id' | 'timestamp'>) => void
  deleteJournalEntry: (id: string) => void

  // Weekly insights
  weeklyInsights: WeeklyInsight
}

export interface WeeklyInsight {
  avgStress: number
  peakDay: string
  calmestDay: string
  totalExercises: number
  journalStreak: number
  topMoods: { mood: MoodTag; count: number }[]
  aiTip: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function clamp(val: number, min: number, max: number) {
  return Math.max(min, Math.min(max, val))
}

function calculateStressScore(hr: number, hrv: number): number {
  // Simplified stress algorithm:
  // Higher HR + Lower HRV = Higher stress
  // Normal resting HR: 60-80, Normal HRV: 40-100ms
  const hrFactor = clamp((hr - 55) / 50, 0, 1) // 55-105 range
  const hrvFactor = clamp(1 - (hrv - 20) / 80, 0, 1) // 20-100 range inverted
  const raw = (hrFactor * 0.4 + hrvFactor * 0.6) * 100
  return Math.round(clamp(raw, 0, 100))
}

function getStressLevel(score: number): 'low' | 'moderate' | 'high' | 'very_high' {
  if (score <= 25) return 'low'
  if (score <= 50) return 'moderate'
  if (score <= 75) return 'high'
  return 'very_high'
}

export function getStressColor(score: number): string {
  if (score <= 25) return '#4ade80' // green
  if (score <= 50) return '#facc15' // yellow
  if (score <= 75) return '#fb923c' // orange
  return '#f87171' // red
}

export function getStressGradient(score: number): [string, string] {
  if (score <= 25) return ['#22c55e', '#4ade80']
  if (score <= 50) return ['#eab308', '#facc15']
  if (score <= 75) return ['#f97316', '#fb923c']
  return ['#ef4444', '#f87171']
}

export function getMoodEmoji(mood: MoodTag): string {
  const map: Record<MoodTag, string> = {
    calm: '😌',
    happy: '😊',
    anxious: '😰',
    stressed: '😫',
    sad: '😢',
    angry: '😠',
    tired: '😴',
    focused: '🧠',
  }
  return map[mood]
}

export function getMoodColor(mood: MoodTag): string {
  const map: Record<MoodTag, string> = {
    calm: '#4ade80',
    happy: '#facc15',
    anxious: '#fb923c',
    stressed: '#f87171',
    sad: '#60a5fa',
    angry: '#ef4444',
    tired: '#a78bfa',
    focused: '#34d399',
  }
  return map[mood]
}

// ─── Generate mock daily trend ────────────────────────────────────────────────

function generateDailyTrend(): DailyTrend[] {
  const now = new Date()
  const currentHour = now.getHours()
  const trend: DailyTrend[] = []

  for (let h = 6; h <= Math.min(currentHour, 23); h++) {
    // Simulate realistic stress patterns:
    // Lower in morning, peaks mid-day, dips after lunch, peaks again in evening
    let baseStress = 30
    if (h >= 9 && h <= 12) baseStress = 55 // morning work stress
    if (h >= 12 && h <= 14) baseStress = 40 // lunch break
    if (h >= 14 && h <= 17) baseStress = 60 // afternoon push
    if (h >= 17 && h <= 19) baseStress = 45 // winding down
    if (h >= 19) baseStress = 35 // evening

    const variation = Math.random() * 20 - 10
    const score = Math.round(clamp(baseStress + variation, 5, 95))

    trend.push({
      hour: h,
      label: `${h > 12 ? h - 12 : h}${h >= 12 ? 'pm' : 'am'}`,
      stressScore: score,
    })
  }
  return trend
}

// ─── Generate mock weekly insights ────────────────────────────────────────────

function generateWeeklyInsights(entries: JournalEntry[]): WeeklyInsight {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const avgStress = Math.round(35 + Math.random() * 30)

  // Count moods from journal entries
  const moodCounts = new Map<MoodTag, number>()
  entries.forEach(e => {
    moodCounts.set(e.mood, (moodCounts.get(e.mood) || 0) + 1)
  })
  const topMoods = Array.from(moodCounts.entries())
    .map(([mood, count]) => ({ mood, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3)

  if (topMoods.length === 0) {
    topMoods.push({ mood: 'calm', count: 3 }, { mood: 'focused', count: 2 })
  }

  const tips = [
    'Your stress peaks around 2-3 PM. Try a short walk or breathing exercise during this time.',
    'Great journaling consistency! Writing about your feelings reduces cortisol by up to 25%.',
    'Your HRV improved 8% this week. Keep up the breathing exercises!',
    'Consider setting boundary alerts — your evening stress is higher than average.',
    'You responded well to box breathing on Tuesday. Make it a daily habit!',
    'Morning stress is lowest — try scheduling important decisions before noon.',
  ]

  return {
    avgStress,
    peakDay: days[Math.floor(Math.random() * 5) + 1], // Mon-Fri
    calmestDay: days[0], // Sunday
    totalExercises: Math.floor(Math.random() * 8) + 3,
    journalStreak: Math.min(entries.length, 7),
    topMoods,
    aiTip: tips[Math.floor(Math.random() * tips.length)],
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────

const StressContext = createContext<StressContextValue | undefined>(undefined)

// ─── Provider ─────────────────────────────────────────────────────────────────

export function StressProvider({ children }: { children: React.ReactNode }) {
  const [heartRate, setHeartRate] = useState(72)
  const [hrv, setHrv] = useState(55)
  const [readings, setReadings] = useState<StressReading[]>([])
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>(() => {
    // Pre-populate with some sample entries
    return [
      {
        id: 'sample-1',
        timestamp: Date.now() - 86400000,
        mood: 'focused',
        stressLevel: 35,
        note: 'Had a productive morning session. Felt in the zone during deep work.',
        tags: ['work', 'productivity'],
      },
      {
        id: 'sample-2',
        timestamp: Date.now() - 172800000,
        mood: 'anxious',
        stressLevel: 65,
        note: 'Presentation deadline approaching. Used box breathing to calm down.',
        tags: ['deadline', 'breathing'],
      },
      {
        id: 'sample-3',
        timestamp: Date.now() - 259200000,
        mood: 'calm',
        stressLevel: 20,
        note: 'Weekend walk in the park. Nature always helps reset.',
        tags: ['nature', 'weekend'],
      },
    ]
  })

  const dailyTrendRef = useRef<DailyTrend[]>(generateDailyTrend())
  const [dailyTrend, setDailyTrend] = useState<DailyTrend[]>(dailyTrendRef.current)

  // Simulate real-time HR/HRV updates
  useEffect(() => {
    const interval = setInterval(() => {
      setHeartRate(prev => {
        const delta = (Math.random() - 0.5) * 4
        return Math.round(clamp(prev + delta, 55, 105))
      })
      setHrv(prev => {
        const delta = (Math.random() - 0.5) * 6
        return Math.round(clamp(prev + delta, 20, 100))
      })
    }, 2000) // Update every 2 seconds

    return () => clearInterval(interval)
  }, [])

  // Record readings every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const score = calculateStressScore(heartRate, hrv)
      setReadings(prev => [...prev.slice(-120), { // Keep last 120 readings (1 hour)
        timestamp: Date.now(),
        heartRate,
        hrv,
        stressScore: score,
      }])
    }, 30000)

    // Add initial reading
    const score = calculateStressScore(heartRate, hrv)
    setReadings([{
      timestamp: Date.now(),
      heartRate,
      hrv,
      stressScore: score,
    }])

    return () => clearInterval(interval)
  }, [])

  // Refresh daily trend periodically
  useEffect(() => {
    const interval = setInterval(() => {
      dailyTrendRef.current = generateDailyTrend()
      setDailyTrend(dailyTrendRef.current)
    }, 300000) // Every 5 minutes
    return () => clearInterval(interval)
  }, [])

  const stressScore = calculateStressScore(heartRate, hrv)
  const stressLevel = getStressLevel(stressScore)

  const addJournalEntry = useCallback((entry: Omit<JournalEntry, 'id' | 'timestamp'>) => {
    const newEntry: JournalEntry = {
      ...entry,
      id: `entry-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      timestamp: Date.now(),
    }
    setJournalEntries(prev => [newEntry, ...prev])
  }, [])

  const deleteJournalEntry = useCallback((id: string) => {
    setJournalEntries(prev => prev.filter(e => e.id !== id))
  }, [])

  // Calculate weekly average from daily trend
  const weeklyAverage = Math.round(
    dailyTrend.reduce((sum, t) => sum + t.stressScore, 0) / Math.max(dailyTrend.length, 1)
  )

  const weeklyInsights = generateWeeklyInsights(journalEntries)

  return (
    <StressContext.Provider
      value={{
        heartRate,
        hrv,
        stressScore,
        stressLevel,
        readings,
        dailyTrend,
        weeklyAverage,
        journalEntries,
        addJournalEntry,
        deleteJournalEntry,
        weeklyInsights,
      }}
    >
      {children}
    </StressContext.Provider>
  )
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useStress() {
  const ctx = useContext(StressContext)
  if (!ctx) throw new Error('useStress must be used within a StressProvider')
  return ctx
}
