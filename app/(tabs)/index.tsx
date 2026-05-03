import { useEffect, useRef } from 'react'
import { View, ScrollView, StyleSheet, Platform } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
} from 'react-native-reanimated'
import Svg, { Circle, Defs, LinearGradient as SvgGradient, Stop, Line, Rect, Text as SvgText } from 'react-native-svg'
import { Text } from '@/components/ui/Text'
import { Card } from '@/components/ui/Card'
import {
  BG,
  SURFACE,
  BORDER,
  TEXT_PRIMARY,
  TEXT_SECONDARY,
  TEXT_TERTIARY,
  ACCENT,
} from '@/lib/theme'
import { TAB_BAR_CLEARANCE } from '@/components/TabBar'
import { useStress, getStressColor, getStressGradient } from '@/contexts/StressContext'

// ─── Circular Stress Score Gauge ──────────────────────────────────────────────

const GAUGE_SIZE = 200
const STROKE_WIDTH = 14
const RADIUS = (GAUGE_SIZE - STROKE_WIDTH) / 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

function StressGauge({ score }: { score: number }) {
  const progress = useSharedValue(0)
  const pulseScale = useSharedValue(1)
  const color = getStressColor(score)
  const [gradStart, gradEnd] = getStressGradient(score)

  useEffect(() => {
    progress.value = withTiming(score / 100, {
      duration: 1200,
      easing: Easing.out(Easing.cubic),
    })
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.04, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    )
  }, [score])

  const animatedPulse = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }))

  const strokeDashoffset = CIRCUMFERENCE * (1 - score / 100)

  const levelLabel =
    score <= 25 ? 'Relaxed' :
    score <= 50 ? 'Moderate' :
    score <= 75 ? 'Elevated' :
    'High Stress'

  return (
    <View style={gaugeStyles.container}>
      <Animated.View style={[gaugeStyles.gaugeWrap, animatedPulse]}>
        {/* Glow effect */}
        <View style={[gaugeStyles.glow, { backgroundColor: color, shadowColor: color }]} />

        <Svg width={GAUGE_SIZE} height={GAUGE_SIZE}>
          <Defs>
            <SvgGradient id="scoreGrad" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor={gradStart} />
              <Stop offset="1" stopColor={gradEnd} />
            </SvgGradient>
          </Defs>

          {/* Background circle */}
          <Circle
            cx={GAUGE_SIZE / 2}
            cy={GAUGE_SIZE / 2}
            r={RADIUS}
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={STROKE_WIDTH}
            fill="none"
          />

          {/* Progress circle */}
          <Circle
            cx={GAUGE_SIZE / 2}
            cy={GAUGE_SIZE / 2}
            r={RADIUS}
            stroke="url(#scoreGrad)"
            strokeWidth={STROKE_WIDTH}
            fill="none"
            strokeDasharray={`${CIRCUMFERENCE}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform={`rotate(-90, ${GAUGE_SIZE / 2}, ${GAUGE_SIZE / 2})`}
          />
        </Svg>

        {/* Center text */}
        <View style={gaugeStyles.centerText}>
          <Text style={[gaugeStyles.scoreValue, { color }]}>{score}</Text>
          <Text style={gaugeStyles.scoreLabel}>{levelLabel}</Text>
        </View>
      </Animated.View>
    </View>
  )
}

const gaugeStyles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center', paddingVertical: 8 },
  gaugeWrap: { position: 'relative', alignItems: 'center', justifyContent: 'center' },
  glow: {
    position: 'absolute',
    width: GAUGE_SIZE * 0.6,
    height: GAUGE_SIZE * 0.6,
    borderRadius: GAUGE_SIZE * 0.3,
    opacity: 0.15,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 40,
    elevation: 0,
  },
  centerText: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: '800',
    letterSpacing: -2,
  },
  scoreLabel: {
    fontSize: 13,
    color: TEXT_SECONDARY,
    fontWeight: '600',
    marginTop: -2,
  },
})

// ─── Mini Stat Card ───────────────────────────────────────────────────────────

function MiniStat({ label, value, unit, color }: { label: string; value: string | number; unit: string; color: string }) {
  return (
    <Card style={s.miniStatCard}>
      <View style={[s.miniStatDot, { backgroundColor: color }]} />
      <Text style={s.miniStatLabel}>{label}</Text>
      <View style={s.miniStatRow}>
        <Text style={[s.miniStatValue, { color }]}>{value}</Text>
        <Text style={s.miniStatUnit}>{unit}</Text>
      </View>
    </Card>
  )
}

// ─── Daily Trend Chart ────────────────────────────────────────────────────────

function DailyTrendChart({ data }: { data: { hour: number; label: string; stressScore: number }[] }) {
  if (data.length === 0) return null

  const chartWidth = 320
  const chartHeight = 120
  const paddingLeft = 30
  const paddingBottom = 24
  const paddingTop = 10
  const barWidth = Math.min(16, (chartWidth - paddingLeft) / data.length - 4)
  const maxScore = 100

  return (
    <Card style={s.chartCard}>
      <View style={s.chartHeader}>
        <Text style={s.chartTitle}>Daily Stress Trend</Text>
        <Text style={s.chartSubtitle}>Today</Text>
      </View>
      <View style={{ alignItems: 'center' }}>
        <Svg width={chartWidth} height={chartHeight + paddingBottom}>
          {/* Y-axis labels */}
          {[0, 25, 50, 75, 100].map(val => {
            const y = paddingTop + (1 - val / maxScore) * chartHeight
            return (
              <SvgText
                key={`y-${val}`}
                x={paddingLeft - 8}
                y={y + 4}
                fontSize={9}
                fill="rgba(255,255,255,0.25)"
                textAnchor="end"
              >
                {val}
              </SvgText>
            )
          })}

          {/* Horizontal grid lines */}
          {[0, 25, 50, 75, 100].map(val => {
            const y = paddingTop + (1 - val / maxScore) * chartHeight
            return (
              <Line
                key={`grid-${val}`}
                x1={paddingLeft}
                y1={y}
                x2={chartWidth}
                y2={y}
                stroke="rgba(255,255,255,0.05)"
                strokeWidth={1}
              />
            )
          })}

          {/* Bars */}
          {data.map((d, i) => {
            const barHeight = (d.stressScore / maxScore) * chartHeight
            const x = paddingLeft + i * ((chartWidth - paddingLeft) / data.length) + barWidth / 2
            const y = paddingTop + chartHeight - barHeight
            const barColor = getStressColor(d.stressScore)

            return (
              <React.Fragment key={`bar-${i}`}>
                <Defs>
                  <SvgGradient id={`barGrad${i}`} x1="0" y1="0" x2="0" y2="1">
                    <Stop offset="0" stopColor={barColor} stopOpacity="0.9" />
                    <Stop offset="1" stopColor={barColor} stopOpacity="0.4" />
                  </SvgGradient>
                </Defs>
                <Rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  rx={barWidth / 2}
                  fill={`url(#barGrad${i})`}
                />
                {/* X-axis label (every other) */}
                {i % 2 === 0 && (
                  <SvgText
                    x={x + barWidth / 2}
                    y={paddingTop + chartHeight + 16}
                    fontSize={9}
                    fill="rgba(255,255,255,0.3)"
                    textAnchor="middle"
                  >
                    {d.label}
                  </SvgText>
                )}
              </React.Fragment>
            )
          })}
        </Svg>
      </View>
    </Card>
  )
}

// ─── Home Screen ──────────────────────────────────────────────────────────────

import React from 'react'

export default function HomeScreen() {
  const insets = useSafeAreaInsets()
  const {
    heartRate,
    hrv,
    stressScore,
    stressLevel,
    dailyTrend,
    weeklyAverage,
  } = useStress()

  const greeting = (() => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  })()

  const stressColor = getStressColor(stressScore)

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: BG }}
      contentContainerStyle={[s.container, { paddingTop: insets.top + 16, paddingBottom: TAB_BAR_CLEARANCE + 16 }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={s.header}>
        <Text style={s.greeting}>{greeting}</Text>
        <Text style={s.subGreeting}>Here's your stress overview</Text>
      </View>

      {/* Live badge */}
      <View style={s.liveBadgeRow}>
        <View style={s.liveBadge}>
          <View style={s.liveDot} />
          <Text style={s.liveText}>Live Monitoring</Text>
        </View>
      </View>

      {/* Circular Stress Score */}
      <StressGauge score={stressScore} />

      {/* Vital Stats */}
      <Text style={s.sectionTitle}>VITALS</Text>
      <View style={s.statsRow}>
        <MiniStat label="Heart Rate" value={heartRate} unit="BPM" color="#f87171" />
        <MiniStat label="HRV" value={hrv} unit="ms" color="#60a5fa" />
        <MiniStat label="Weekly Avg" value={weeklyAverage} unit="score" color={ACCENT} />
      </View>

      {/* Daily Trend Chart */}
      <DailyTrendChart data={dailyTrend} />

      {/* Quick tips */}
      <Card style={s.tipCard}>
        <View style={s.tipHeader}>
          <Text style={s.tipIcon}>💡</Text>
          <Text style={s.tipTitle}>AI Insight</Text>
        </View>
        <Text style={s.tipText}>
          {stressScore <= 25
            ? "You're doing great! Your stress levels are low. Keep up the healthy habits."
            : stressScore <= 50
            ? 'Moderate stress detected. Consider a quick breathing exercise to stay balanced.'
            : stressScore <= 75
            ? 'Your stress is elevated. Try a 5-minute body scan or guided breathing session.'
            : 'High stress alert! Take a break now. Open the Relief tab for immediate exercises.'}
        </Text>
      </Card>
    </ScrollView>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  container: { paddingHorizontal: 20, gap: 14 },
  header: { gap: 4, marginBottom: 0 },
  greeting: { fontSize: 26, fontWeight: '800', color: '#fff', letterSpacing: -0.6 },
  subGreeting: { fontSize: 14, color: TEXT_SECONDARY },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: TEXT_TERTIARY,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginTop: 4,
  },
  liveBadgeRow: { alignItems: 'center' },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(74, 222, 128, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#4ade80',
  },
  liveText: {
    fontSize: 12,
    color: '#4ade80',
    fontWeight: '600',
  },
  statsRow: { flexDirection: 'row', gap: 10 },
  miniStatCard: { flex: 1, padding: 12, gap: 4 },
  miniStatDot: { width: 6, height: 6, borderRadius: 3 },
  miniStatLabel: { fontSize: 10, color: TEXT_TERTIARY, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.4 },
  miniStatRow: { flexDirection: 'row', alignItems: 'baseline', gap: 3 },
  miniStatValue: { fontSize: 22, fontWeight: '800', letterSpacing: -0.5 },
  miniStatUnit: { fontSize: 10, color: TEXT_TERTIARY, fontWeight: '500' },
  chartCard: { padding: 16, gap: 10 },
  chartHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  chartTitle: { fontSize: 15, fontWeight: '700', color: TEXT_PRIMARY },
  chartSubtitle: { fontSize: 12, color: TEXT_TERTIARY },
  tipCard: {
    padding: 16,
    gap: 8,
    borderLeftWidth: 3,
    borderLeftColor: ACCENT,
  },
  tipHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  tipIcon: { fontSize: 18 },
  tipTitle: { fontSize: 14, fontWeight: '700', color: TEXT_PRIMARY },
  tipText: { fontSize: 13, color: TEXT_SECONDARY, lineHeight: 20 },
})
