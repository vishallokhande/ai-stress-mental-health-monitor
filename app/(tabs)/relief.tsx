import React, { useState, useEffect, useCallback } from 'react'
import { View, ScrollView, StyleSheet, Pressable, Dimensions } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  withDelay,
  Easing,
  runOnJS,
  cancelAnimation,
} from 'react-native-reanimated'
import { Text } from '@/components/ui/Text'
import { Card } from '@/components/ui/Card'
import {
  ACCENT,
  BG,
  BORDER,
  SURFACE,
  SURFACE2,
  TEXT_PRIMARY,
  TEXT_SECONDARY,
  TEXT_TERTIARY,
} from '@/lib/theme'
import { TAB_BAR_CLEARANCE } from '@/components/TabBar'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

// ─── Breathing Exercise Types ─────────────────────────────────────────────────

interface BreathingPattern {
  id: string
  name: string
  description: string
  icon: string
  color: string
  inhale: number
  hold1: number
  exhale: number
  hold2: number
  rounds: number
}

const BREATHING_PATTERNS: BreathingPattern[] = [
  {
    id: 'box',
    name: 'Box Breathing',
    description: 'Equal parts inhale, hold, exhale, hold. Used by Navy SEALs for calm focus.',
    icon: '🫁',
    color: '#60a5fa',
    inhale: 4, hold1: 4, exhale: 4, hold2: 4,
    rounds: 4,
  },
  {
    id: '478',
    name: '4-7-8 Technique',
    description: 'Dr. Weil\'s relaxation breath. Activates parasympathetic nervous system.',
    icon: '🌙',
    color: '#a78bfa',
    inhale: 4, hold1: 7, exhale: 8, hold2: 0,
    rounds: 4,
  },
  {
    id: 'calm',
    name: 'Calming Breath',
    description: 'Extended exhale pattern for immediate anxiety relief.',
    icon: '🍃',
    color: '#4ade80',
    inhale: 4, hold1: 2, exhale: 6, hold2: 2,
    rounds: 5,
  },
  {
    id: 'energize',
    name: 'Energizing Breath',
    description: 'Quick rhythmic breathing to boost alertness and energy.',
    icon: '⚡',
    color: '#facc15',
    inhale: 3, hold1: 0, exhale: 3, hold2: 0,
    rounds: 6,
  },
]

// ─── CBT Techniques ───────────────────────────────────────────────────────────

interface CBTTechnique {
  id: string
  name: string
  duration: string
  icon: string
  color: string
  description: string
  steps: string[]
}

const CBT_TECHNIQUES: CBTTechnique[] = [
  {
    id: 'body-scan',
    name: 'Body Scan',
    duration: '5 min',
    icon: '🧘',
    color: '#34d399',
    description: 'Progressive relaxation from head to toe',
    steps: [
      'Close your eyes and take 3 deep breaths',
      'Focus on the top of your head. Notice any tension.',
      'Move attention to your forehead, eyebrows, and eyes. Relax them.',
      'Shift focus to your jaw, neck, and shoulders. Let them drop.',
      'Notice your arms, hands, and fingers. Release any tightness.',
      'Bring awareness to your chest and stomach. Breathe into any tension.',
      'Focus on your lower back, hips, and legs.',
      'Finally, notice your feet and toes. Ground yourself.',
      'Take 3 deep breaths and slowly open your eyes.',
    ],
  },
  {
    id: 'thought-challenge',
    name: 'Thought Challenge',
    duration: '3 min',
    icon: '🧠',
    color: '#f472b6',
    description: 'Reframe negative thought patterns',
    steps: [
      'Identify the stressful thought. Write it down mentally.',
      'Rate the thought\'s intensity (1-10).',
      'Ask: "What evidence supports this thought?"',
      'Ask: "What evidence contradicts it?"',
      'Ask: "Would I say this to a friend in my situation?"',
      'Create a balanced alternative thought.',
      'Rate the original thought\'s intensity again.',
    ],
  },
  {
    id: 'grounding',
    name: '5-4-3-2-1 Grounding',
    duration: '2 min',
    icon: '🌍',
    color: '#fb923c',
    description: 'Sensory awareness technique for anxiety',
    steps: [
      'Name 5 things you can SEE around you.',
      'Name 4 things you can TOUCH or feel.',
      'Name 3 things you can HEAR right now.',
      'Name 2 things you can SMELL.',
      'Name 1 thing you can TASTE.',
      'Take a deep breath. You are present. You are safe.',
    ],
  },
  {
    id: 'gratitude',
    name: 'Gratitude Pause',
    duration: '2 min',
    icon: '🙏',
    color: '#facc15',
    description: 'Shift focus to positive experiences',
    steps: [
      'Close your eyes and take a slow breath.',
      'Think of one person you\'re grateful for today.',
      'Think of one experience that made you smile recently.',
      'Think of one ability or strength you\'re thankful for.',
      'Hold these feelings of warmth for 30 seconds.',
      'Open your eyes with a gentle smile.',
    ],
  },
]

// ─── Breathing Animation Component ───────────────────────────────────────────

function BreathingExercise({ pattern, onComplete }: { pattern: BreathingPattern; onComplete: () => void }) {
  const [phase, setPhase] = useState<'inhale' | 'hold1' | 'exhale' | 'hold2'>('inhale')
  const [currentRound, setCurrentRound] = useState(1)
  const [countdown, setCountdown] = useState(pattern.inhale)
  const circleScale = useSharedValue(0.5)
  const circleOpacity = useSharedValue(0.6)

  const phaseRef = React.useRef(phase)
  const roundRef = React.useRef(currentRound)
  const mountedRef = React.useRef(true)

  useEffect(() => {
    phaseRef.current = phase
    roundRef.current = currentRound
  }, [phase, currentRound])

  useEffect(() => {
    mountedRef.current = true
    return () => { mountedRef.current = false }
  }, [])

  const getPhaseLabel = () => {
    switch (phase) {
      case 'inhale': return 'Breathe In'
      case 'hold1': return 'Hold'
      case 'exhale': return 'Breathe Out'
      case 'hold2': return 'Hold'
    }
  }

  const getPhaseDuration = (p: typeof phase) => {
    switch (p) {
      case 'inhale': return pattern.inhale
      case 'hold1': return pattern.hold1
      case 'exhale': return pattern.exhale
      case 'hold2': return pattern.hold2
    }
  }

  const getNextPhase = (p: typeof phase): typeof phase | 'done' => {
    if (p === 'inhale') return pattern.hold1 > 0 ? 'hold1' : 'exhale'
    if (p === 'hold1') return 'exhale'
    if (p === 'exhale') return pattern.hold2 > 0 ? 'hold2' : 'next_round' as any
    return 'next_round' as any
  }

  // Animate circle based on phase
  useEffect(() => {
    if (phase === 'inhale') {
      circleScale.value = withTiming(1, { duration: pattern.inhale * 1000, easing: Easing.inOut(Easing.ease) })
      circleOpacity.value = withTiming(1, { duration: pattern.inhale * 1000 })
    } else if (phase === 'exhale') {
      circleScale.value = withTiming(0.5, { duration: pattern.exhale * 1000, easing: Easing.inOut(Easing.ease) })
      circleOpacity.value = withTiming(0.6, { duration: pattern.exhale * 1000 })
    }
  }, [phase])

  // Countdown timer
  useEffect(() => {
    const dur = getPhaseDuration(phase)
    if (dur === 0) {
      // Skip this phase
      const next = getNextPhase(phase)
      if (next === 'next_round' as any) {
        if (roundRef.current >= pattern.rounds) {
          onComplete()
          return
        }
        setCurrentRound(prev => prev + 1)
        setPhase('inhale')
        setCountdown(pattern.inhale)
      } else {
        setPhase(next as any)
        setCountdown(getPhaseDuration(next as any))
      }
      return
    }

    setCountdown(dur)
    const interval = setInterval(() => {
      if (!mountedRef.current) return
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval)
          const next = getNextPhase(phaseRef.current)
          if (next === 'next_round' as any) {
            if (roundRef.current >= pattern.rounds) {
              onComplete()
              return 0
            }
            setCurrentRound(r => r + 1)
            setPhase('inhale')
            return pattern.inhale
          }
          setPhase(next as any)
          return getPhaseDuration(next as any)
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [phase, currentRound])

  const animatedCircle = useAnimatedStyle(() => ({
    transform: [{ scale: circleScale.value }],
    opacity: circleOpacity.value,
  }))

  return (
    <View style={breathStyles.container}>
      <Text style={breathStyles.roundText}>Round {currentRound} of {pattern.rounds}</Text>

      <View style={breathStyles.circleContainer}>
        {/* Outer ring */}
        <View style={[breathStyles.outerRing, { borderColor: pattern.color + '30' }]} />

        {/* Animated breathing circle */}
        <Animated.View
          style={[
            breathStyles.breathCircle,
            { backgroundColor: pattern.color + '25', borderColor: pattern.color + '60' },
            animatedCircle,
          ]}
        />

        {/* Center text */}
        <View style={breathStyles.centerContent}>
          <Text style={[breathStyles.phaseLabel, { color: pattern.color }]}>{getPhaseLabel()}</Text>
          <Text style={breathStyles.countdownText}>{countdown}</Text>
        </View>
      </View>

      <Pressable onPress={onComplete} style={breathStyles.stopBtn}>
        <Text style={breathStyles.stopText}>Stop Exercise</Text>
      </Pressable>
    </View>
  )
}

const breathStyles = StyleSheet.create({
  container: { alignItems: 'center', gap: 24, paddingVertical: 20 },
  roundText: { fontSize: 13, color: TEXT_TERTIARY, fontWeight: '600' },
  circleContainer: {
    width: 220,
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outerRing: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 2,
  },
  breathCircle: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 2,
  },
  centerContent: {
    alignItems: 'center',
    gap: 4,
  },
  phaseLabel: {
    fontSize: 18,
    fontWeight: '700',
  },
  countdownText: {
    fontSize: 42,
    fontWeight: '800',
    color: TEXT_PRIMARY,
    letterSpacing: -1,
  },
  stopBtn: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: BORDER,
  },
  stopText: { fontSize: 13, color: TEXT_SECONDARY, fontWeight: '600' },
})

// ─── CBT Exercise Expanded View ──────────────────────────────────────────────

function CBTExerciseView({ technique, onComplete }: { technique: CBTTechnique; onComplete: () => void }) {
  const [currentStep, setCurrentStep] = useState(0)
  const fadeValue = useSharedValue(1)

  const goNext = () => {
    if (currentStep >= technique.steps.length - 1) {
      onComplete()
      return
    }
    fadeValue.value = withSequence(
      withTiming(0, { duration: 200 }),
      withTiming(1, { duration: 300 })
    )
    setTimeout(() => setCurrentStep(prev => prev + 1), 200)
  }

  const animatedFade = useAnimatedStyle(() => ({
    opacity: fadeValue.value,
  }))

  return (
    <View style={cbtStyles.container}>
      <View style={cbtStyles.progressRow}>
        {technique.steps.map((_, i) => (
          <View
            key={i}
            style={[
              cbtStyles.progressDot,
              i <= currentStep && { backgroundColor: technique.color },
            ]}
          />
        ))}
      </View>

      <Text style={cbtStyles.stepLabel}>Step {currentStep + 1} of {technique.steps.length}</Text>

      <Animated.View style={[cbtStyles.stepCard, animatedFade]}>
        <Text style={cbtStyles.stepIcon}>{technique.icon}</Text>
        <Text style={cbtStyles.stepText}>{technique.steps[currentStep]}</Text>
      </Animated.View>

      <View style={cbtStyles.buttonRow}>
        <Pressable onPress={onComplete} style={cbtStyles.backBtn}>
          <Text style={cbtStyles.backText}>Exit</Text>
        </Pressable>
        <Pressable
          onPress={goNext}
          style={[cbtStyles.nextBtn, { backgroundColor: technique.color + '20', borderColor: technique.color + '40' }]}
        >
          <Text style={[cbtStyles.nextText, { color: technique.color }]}>
            {currentStep >= technique.steps.length - 1 ? 'Complete' : 'Next Step'}
          </Text>
        </Pressable>
      </View>
    </View>
  )
}

const cbtStyles = StyleSheet.create({
  container: { alignItems: 'center', gap: 20, paddingVertical: 16 },
  progressRow: { flexDirection: 'row', gap: 6 },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  stepLabel: { fontSize: 12, color: TEXT_TERTIARY, fontWeight: '600' },
  stepCard: {
    backgroundColor: SURFACE2,
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    gap: 16,
    width: '100%',
    minHeight: 180,
    justifyContent: 'center',
  },
  stepIcon: { fontSize: 40 },
  stepText: {
    fontSize: 17,
    color: TEXT_PRIMARY,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 26,
  },
  buttonRow: { flexDirection: 'row', gap: 12, width: '100%' },
  backBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: BORDER,
  },
  backText: { fontSize: 14, color: TEXT_SECONDARY, fontWeight: '600' },
  nextBtn: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
  },
  nextText: { fontSize: 14, fontWeight: '700' },
})

// ─── Main Relief Screen ──────────────────────────────────────────────────────

export default function ReliefScreen() {
  const insets = useSafeAreaInsets()
  const [activeBreathing, setActiveBreathing] = useState<BreathingPattern | null>(null)
  const [activeCBT, setActiveCBT] = useState<CBTTechnique | null>(null)

  if (activeBreathing) {
    return (
      <ScrollView
        style={{ flex: 1, backgroundColor: BG }}
        contentContainerStyle={[s.container, { paddingTop: insets.top + 16, paddingBottom: TAB_BAR_CLEARANCE + 16 }]}
      >
        <Text style={s.title}>{activeBreathing.name}</Text>
        <Text style={s.subtitle}>{activeBreathing.description}</Text>
        <BreathingExercise
          pattern={activeBreathing}
          onComplete={() => setActiveBreathing(null)}
        />
      </ScrollView>
    )
  }

  if (activeCBT) {
    return (
      <ScrollView
        style={{ flex: 1, backgroundColor: BG }}
        contentContainerStyle={[s.container, { paddingTop: insets.top + 16, paddingBottom: TAB_BAR_CLEARANCE + 16 }]}
      >
        <Text style={s.title}>{activeCBT.name}</Text>
        <Text style={s.subtitle}>{activeCBT.description}</Text>
        <CBTExerciseView
          technique={activeCBT}
          onComplete={() => setActiveCBT(null)}
        />
      </ScrollView>
    )
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: BG }}
      contentContainerStyle={[s.container, { paddingTop: insets.top + 16, paddingBottom: TAB_BAR_CLEARANCE + 16 }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={s.header}>
        <Text style={s.title}>Stress Relief</Text>
        <Text style={s.subtitle}>Guided exercises to help you decompress</Text>
      </View>

      {/* Breathing Exercises Section */}
      <Text style={s.sectionTitle}>BREATHING EXERCISES</Text>
      {BREATHING_PATTERNS.map((pattern) => (
        <Pressable
          key={pattern.id}
          onPress={() => setActiveBreathing(pattern)}
          style={({ pressed }) => [pressed && { opacity: 0.8 }]}
        >
          <Card style={s.exerciseCard}>
            <View style={s.exerciseRow}>
              <View style={[s.exerciseIcon, { backgroundColor: pattern.color + '18' }]}>
                <Text style={s.exerciseEmoji}>{pattern.icon}</Text>
              </View>
              <View style={s.exerciseInfo}>
                <Text style={s.exerciseName}>{pattern.name}</Text>
                <Text style={s.exerciseDesc}>{pattern.description}</Text>
                <View style={s.exerciseMetaRow}>
                  <View style={[s.exerciseTag, { borderColor: pattern.color + '30' }]}>
                    <Text style={[s.exerciseTagText, { color: pattern.color }]}>
                      {pattern.inhale}-{pattern.hold1}-{pattern.exhale}-{pattern.hold2}
                    </Text>
                  </View>
                  <Text style={s.exerciseDuration}>{pattern.rounds} rounds</Text>
                </View>
              </View>
              <View style={[s.playBtn, { backgroundColor: pattern.color + '20', borderColor: pattern.color + '40' }]}>
                <Text style={[s.playIcon, { color: pattern.color }]}>▶</Text>
              </View>
            </View>
          </Card>
        </Pressable>
      ))}

      {/* CBT Techniques Section */}
      <Text style={[s.sectionTitle, { marginTop: 8 }]}>CBT TECHNIQUES</Text>
      {CBT_TECHNIQUES.map((technique) => (
        <Pressable
          key={technique.id}
          onPress={() => setActiveCBT(technique)}
          style={({ pressed }) => [pressed && { opacity: 0.8 }]}
        >
          <Card style={s.exerciseCard}>
            <View style={s.exerciseRow}>
              <View style={[s.exerciseIcon, { backgroundColor: technique.color + '18' }]}>
                <Text style={s.exerciseEmoji}>{technique.icon}</Text>
              </View>
              <View style={s.exerciseInfo}>
                <Text style={s.exerciseName}>{technique.name}</Text>
                <Text style={s.exerciseDesc}>{technique.description}</Text>
                <View style={s.exerciseMetaRow}>
                  <Text style={s.exerciseDuration}>{technique.duration}</Text>
                  <Text style={s.exerciseDuration}>•</Text>
                  <Text style={s.exerciseDuration}>{technique.steps.length} steps</Text>
                </View>
              </View>
              <View style={[s.playBtn, { backgroundColor: technique.color + '20', borderColor: technique.color + '40' }]}>
                <Text style={[s.playIcon, { color: technique.color }]}>▶</Text>
              </View>
            </View>
          </Card>
        </Pressable>
      ))}
    </ScrollView>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  container: { paddingHorizontal: 20, gap: 12 },
  header: { gap: 4, marginBottom: 4 },
  title: { fontSize: 24, fontWeight: '800', color: TEXT_PRIMARY, letterSpacing: -0.5 },
  subtitle: { fontSize: 13, color: TEXT_SECONDARY },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: TEXT_TERTIARY,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginTop: 4,
  },
  exerciseCard: { padding: 14 },
  exerciseRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  exerciseIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exerciseEmoji: { fontSize: 24 },
  exerciseInfo: { flex: 1, gap: 3 },
  exerciseName: { fontSize: 15, fontWeight: '700', color: TEXT_PRIMARY },
  exerciseDesc: { fontSize: 12, color: TEXT_SECONDARY, lineHeight: 17 },
  exerciseMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2 },
  exerciseTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  exerciseTagText: { fontSize: 11, fontWeight: '700' },
  exerciseDuration: { fontSize: 11, color: TEXT_TERTIARY, fontWeight: '500' },
  playBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  playIcon: { fontSize: 12, marginLeft: 2 },
})
