/**
 * Tabs layout — StressWatch AI Stress Monitor
 * 
 * Four main tabs:
 *   1. Home — Real-time stress dashboard
 *   2. Relief — Breathing exercises & CBT techniques
 *   3. Journal — Stress journal with mood tags
 *   4. Insights — Weekly AI-powered insights
 */
import { Tabs } from 'expo-router'
import { Heart, Wind, BookOpen, BarChart3 } from 'lucide-react-native'
import TabBar, { TAB_BAR_HEIGHT } from '@/components/TabBar'
import { BG } from '@/lib/theme'

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: BG },
        tabBarStyle: { height: TAB_BAR_HEIGHT },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Heart size={size} color={color} strokeWidth={1.6} />
          ),
        }}
      />

      <Tabs.Screen
        name="relief"
        options={{
          tabBarLabel: 'Relief',
          tabBarIcon: ({ color, size }) => (
            <Wind size={size} color={color} strokeWidth={1.6} />
          ),
        }}
      />

      <Tabs.Screen
        name="journal"
        options={{
          tabBarLabel: 'Journal',
          tabBarIcon: ({ color, size }) => (
            <BookOpen size={size} color={color} strokeWidth={1.6} />
          ),
        }}
      />

      <Tabs.Screen
        name="insights"
        options={{
          tabBarLabel: 'Insights',
          tabBarIcon: ({ color, size }) => (
            <BarChart3 size={size} color={color} strokeWidth={1.6} />
          ),
        }}
      />
    </Tabs>
  )
}
