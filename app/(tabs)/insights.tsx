import React, { useMemo } from 'react'
import { View, ScrollView, StyleSheet } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Svg, {
  Rect,
  Line,
  Circle as SvgCircle,
  Text as SvgText,
  Defs,
  LinearGradient as SvgGradient,
  Stop,
  Path,
} from 'react-native-svg'
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
import {
  useStress,
  getStressColor,
  getMoodEmoji,
  getMoodColor,
} from '@/contexts/StressContext'

// ─── Weekly Chart ─────────────────────────────────────────────────────────────

function WeeklyStressChart() {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  // Generate mock weekly data
  const weekData = useMemo(() => [
    { day: 'Mon', score: 45 },
    { day: 'Tue', score: 62 },
    { day: 'Wed', score: 38 },
    { day: 'Thu', score: 55 },
    { day: 'Fri', score: 70 },
    { day: 'Sat', score: 28 },
    { day: 'Sun', score: 22 },
  ], [])

  const chartWidth = 320
  const chartHeight = 140
  const paddingLeft = 30
  const paddingBottom = 24
  const paddingTop = 10
  const plotWidth = chartWidth - paddingLeft
  const plotHeight = chartHeight - paddingTop
  const maxScore = 100

  // Build line path
  const points = weekData.map((d, i) => {
    const x = paddingLeft + (i / (weekData.length - 1)) * plotWidth
    const y = paddingTop + (1 - d.score / maxScore) * plotHeight
    return { x, y, score: d.score }
  })

  let linePath = `M ${points[0].x} ${points[0].y}`
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1]
    const curr = points[i]
    const cpx1 = prev.x + (curr.x - prev.x) / 3
    const cpx2 = prev.x + 2 * (curr.x - prev.x) / 3
    linePath += ` C ${cpx1} ${prev.y}, ${cpx2} ${curr.y}, ${curr.x} ${curr.y}`
  }

  // Area path (fill under curve)
  const areaPath = linePath + ` L ${points[points.length - 1].x} ${paddingTop + plotHeight} L ${points[0].x} ${paddingTop + plotHeight} Z`

  return (
    <Card style={chartStyles.card}>
      <View style={chartStyles.header}>
        <Text style={chartStyles.title}>Weekly Stress Overview</Text>
        <Text style={chartStyles.subtitle}>This week</Text>
      </View>
      <View style={{ alignItems: 'center' }}>
        <Svg width={chartWidth} height={chartHeight + paddingBottom}>
          <Defs>
            <SvgGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={ACCENT} stopOpacity="0.3" />
              <Stop offset="1" stopColor={ACCENT} stopOpacity="0.02" />
            </SvgGradient>
            <SvgGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
              <Stop offset="0" stopColor="#4ade80" />
              <Stop offset="0.5" stopColor="#facc15" />
              <Stop offset="1" stopColor="#f87171" />
            </SvgGradient>
          </Defs>

          {/* Horizontal grid */}
          {[0, 25, 50, 75, 100].map(val => {
            const y = paddingTop + (1 - val / maxScore) * plotHeight
            return (
              <React.Fragment key={`grid-${val}`}>
                <Line x1={paddingLeft} y1={y} x2={chartWidth} y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth={1} />
                <SvgText x={paddingLeft - 8} y={y + 4} fontSize={9} fill="rgba(255,255,255,0.25)" textAnchor="end">{val}</SvgText>
              </React.Fragment>
            )
          })}

          {/* Area fill */}
          <Path d={areaPath} fill="url(#areaGrad)" />

          {/* Line */}
          <Path d={linePath} stroke={ACCENT} strokeWidth={2.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />

          {/* Data points */}
          {points.map((p, i) => (
            <React.Fragment key={`pt-${i}`}>
              <SvgCircle cx={p.x} cy={p.y} r={5} fill={getStressColor(p.score)} stroke={BG} strokeWidth={2} />
              <SvgText x={p.x} y={chartHeight + 16} fontSize={10} fill="rgba(255,255,255,0.35)" textAnchor="middle">
                {weekData[i].day}
              </SvgText>
            </React.Fragment>
          ))}
        </Svg>
      </View>
    </Card>
  )
}

const chartStyles = StyleSheet.create({
  card: { padding: 16, gap: 12 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 15, fontWeight: '700', color: TEXT_PRIMARY },
  subtitle: { fontSize: 12, color: TEXT_TERTIARY },
})

// ─── Stat Card ────────────────────────────────────────────────────────────────

function InsightStat({ label, value, icon, color }: { label: string; value: string | number; icon: string; color: string }) {
  return (
    <Card style={statStyles.card}>
      <View style={[statStyles.iconWrap, { backgroundColor: color + '18' }]}>
        <Text style={statStyles.icon}>{icon}</Text>
      </View>
      <Text style={statStyles.label}>{label}</Text>
      <Text style={[statStyles.value, { color }]}>{value}</Text>
    </Card>
  )
}

const statStyles = StyleSheet.create({
  card: { flex: 1, padding: 14, gap: 8, alignItems: 'center' },
  iconWrap: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  icon: { fontSize: 20 },
  label: { fontSize: 10, color: TEXT_TERTIARY, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.4, textAlign: 'center' },
  value: { fontSize: 20, fontWeight: '800', letterSpacing: -0.3 },
})

// ─── Main Insights Screen ────────────────────────────────────────────────────

export default function InsightsScreen() {
  const insets = useSafeAreaInsets()
  const { weeklyInsights, weeklyAverage, journalEntries } = useStress()

  const avgColor = getStressColor(weeklyInsights.avgStress)

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: BG }}
      contentContainerStyle={[s.container, { paddingTop: insets.top + 16, paddingBottom: TAB_BAR_CLEARANCE + 16 }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={s.header}>
        <Text style={s.title}>Weekly Insights</Text>
        <Text style={s.subtitle}>AI-powered analysis of your stress patterns</Text>
      </View>

      {/* Weekly Chart */}
      <WeeklyStressChart />

      {/* Stats Grid */}
      <Text style={s.sectionTitle}>THIS WEEK'S SUMMARY</Text>
      <View style={s.statsRow}>
        <InsightStat label="Avg Stress" value={weeklyInsights.avgStress} icon="📊" color={avgColor} />
        <InsightStat label="Exercises" value={weeklyInsights.totalExercises} icon="🫁" color="#60a5fa" />
        <InsightStat label="Journal Streak" value={`${weeklyInsights.journalStreak}d`} icon="🔥" color="#fb923c" />
      </View>

      {/* Peak and Calmest Days */}
      <View style={s.daysRow}>
        <Card style={[s.dayCard, { borderLeftColor: '#f87171' }]}>
          <Text style={s.dayLabel}>Most Stressful</Text>
          <Text style={[s.dayValue, { color: '#f87171' }]}>{weeklyInsights.peakDay}</Text>
          <Text style={s.dayHint}>Consider adjusting your schedule</Text>
        </Card>
        <Card style={[s.dayCard, { borderLeftColor: '#4ade80' }]}>
          <Text style={s.dayLabel}>Most Calm</Text>
          <Text style={[s.dayValue, { color: '#4ade80' }]}>{weeklyInsights.calmestDay}</Text>
          <Text style={s.dayHint}>What made this day different?</Text>
        </Card>
      </View>

      {/* Top Moods */}
      <Text style={s.sectionTitle}>TOP MOODS</Text>
      <Card style={s.moodsCard}>
        {weeklyInsights.topMoods.map((item, idx) => {
          const moodColor = getMoodColor(item.mood)
          const maxCount = weeklyInsights.topMoods[0]?.count || 1
          const barWidth = `${Math.max(20, (item.count / maxCount) * 100)}%`

          return (
            <View key={item.mood} style={s.moodRow}>
              <View style={s.moodInfo}>
                <Text style={s.moodEmoji}>{getMoodEmoji(item.mood)}</Text>
                <Text style={[s.moodName, { color: moodColor }]}>{item.mood}</Text>
              </View>
              <View style={s.moodBarBg}>
                <View style={[s.moodBar, { width: barWidth as any, backgroundColor: moodColor + '40' }]}>
                  <View style={[s.moodBarFill, { backgroundColor: moodColor }]} />
                </View>
              </View>
              <Text style={s.moodCount}>{item.count}x</Text>
            </View>
          )
        })}
      </Card>

      {/* AI Insight */}
      <Text style={s.sectionTitle}>AI RECOMMENDATION</Text>
      <Card style={s.aiCard}>
        <View style={s.aiHeader}>
          <View style={s.aiBadge}>
            <Text style={s.aiBadgeText}>✨ AI</Text>
          </View>
          <Text style={s.aiTitle}>Personalized Insight</Text>
        </View>
        <Text style={s.aiText}>{weeklyInsights.aiTip}</Text>
      </Card>

      {/* Stress Distribution */}
      <Text style={s.sectionTitle}>STRESS DISTRIBUTION</Text>
      <Card style={s.distCard}>
        {[
          { label: 'Low (0-25)', range: 'Relaxed', color: '#4ade80', pct: 35 },
          { label: 'Moderate (26-50)', range: 'Manageable', color: '#facc15', pct: 30 },
          { label: 'High (51-75)', range: 'Elevated', color: '#fb923c', pct: 25 },
          { label: 'Very High (76-100)', range: 'Critical', color: '#f87171', pct: 10 },
        ].map(item => (
          <View key={item.label} style={s.distRow}>
            <View style={s.distInfo}>
              <View style={[s.distDot, { backgroundColor: item.color }]} />
              <Text style={s.distLabel}>{item.label}</Text>
            </View>
            <View style={s.distBarBg}>
              <View style={[s.distBar, { width: `${item.pct}%` as any, backgroundColor: item.color + '60' }]} />
            </View>
            <Text style={[s.distPct, { color: item.color }]}>{item.pct}%</Text>
          </View>
        ))}
      </Card>

      {/* Weekly Tips */}
      <Text style={s.sectionTitle}>WELLNESS TIPS</Text>
      {[
        { icon: '💤', title: 'Prioritize Sleep', desc: 'Aim for 7-9 hours. Poor sleep increases cortisol by up to 45%.', color: '#a78bfa' },
        { icon: '🏃', title: 'Move Your Body', desc: '30 min of moderate exercise reduces stress hormones significantly.', color: '#34d399' },
        { icon: '📱', title: 'Digital Sunset', desc: 'Reduce screen time 1 hour before bed to improve sleep quality.', color: '#fb923c' },
      ].map(tip => (
        <Card key={tip.title} style={s.tipCard}>
          <View style={s.tipRow}>
            <View style={[s.tipIconWrap, { backgroundColor: tip.color + '18' }]}>
              <Text style={s.tipIcon}>{tip.icon}</Text>
            </View>
            <View style={s.tipInfo}>
              <Text style={s.tipTitle}>{tip.title}</Text>
              <Text style={s.tipDesc}>{tip.desc}</Text>
            </View>
          </View>
        </Card>
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
  statsRow: { flexDirection: 'row', gap: 10 },
  daysRow: { flexDirection: 'row', gap: 10 },
  dayCard: { flex: 1, padding: 14, gap: 4, borderLeftWidth: 3 },
  dayLabel: { fontSize: 10, color: TEXT_TERTIARY, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.4 },
  dayValue: { fontSize: 18, fontWeight: '800', letterSpacing: -0.3 },
  dayHint: { fontSize: 11, color: TEXT_TERTIARY, lineHeight: 16 },
  moodsCard: { padding: 16, gap: 14 },
  moodRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  moodInfo: { flexDirection: 'row', alignItems: 'center', gap: 6, width: 90 },
  moodEmoji: { fontSize: 18 },
  moodName: { fontSize: 13, fontWeight: '700', textTransform: 'capitalize' },
  moodBarBg: { flex: 1, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.05)' },
  moodBar: { height: 8, borderRadius: 4, flexDirection: 'row' },
  moodBarFill: { width: 3, height: '100%', borderRadius: 4 },
  moodCount: { fontSize: 12, color: TEXT_TERTIARY, fontWeight: '700', width: 28, textAlign: 'right' },
  aiCard: { padding: 18, gap: 12, borderWidth: 1, borderColor: ACCENT + '25' },
  aiHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  aiBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: ACCENT + '20',
  },
  aiBadgeText: { fontSize: 11, color: ACCENT, fontWeight: '700' },
  aiTitle: { fontSize: 15, fontWeight: '700', color: TEXT_PRIMARY },
  aiText: { fontSize: 14, color: TEXT_SECONDARY, lineHeight: 22 },
  distCard: { padding: 16, gap: 12 },
  distRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  distInfo: { flexDirection: 'row', alignItems: 'center', gap: 6, width: 130 },
  distDot: { width: 8, height: 8, borderRadius: 4 },
  distLabel: { fontSize: 11, color: TEXT_SECONDARY, fontWeight: '500' },
  distBarBg: { flex: 1, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.05)' },
  distBar: { height: 6, borderRadius: 3 },
  distPct: { fontSize: 12, fontWeight: '700', width: 32, textAlign: 'right' },
  tipCard: { padding: 14 },
  tipRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  tipIconWrap: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  tipIcon: { fontSize: 22 },
  tipInfo: { flex: 1, gap: 3 },
  tipTitle: { fontSize: 14, fontWeight: '700', color: TEXT_PRIMARY },
  tipDesc: { fontSize: 12, color: TEXT_SECONDARY, lineHeight: 18 },
})
