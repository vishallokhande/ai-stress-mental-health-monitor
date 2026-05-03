import React, { useState, useMemo } from 'react'
import { View, ScrollView, StyleSheet, Pressable, TextInput, KeyboardAvoidingView, Platform } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Animated, {
  FadeIn,
  FadeOut,
  SlideInRight,
  Layout,
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
import {
  useStress,
  getMoodEmoji,
  getMoodColor,
  getStressColor,
  type MoodTag,
  type JournalEntry,
} from '@/contexts/StressContext'

// ─── Mood Selector ────────────────────────────────────────────────────────────

const ALL_MOODS: MoodTag[] = ['calm', 'happy', 'anxious', 'stressed', 'sad', 'angry', 'tired', 'focused']

const QUICK_TAGS = ['work', 'health', 'relationships', 'sleep', 'exercise', 'nature', 'deadline', 'social', 'productivity', 'breathing']

// ─── New Entry Form ───────────────────────────────────────────────────────────

function NewEntryForm({ onSubmit, onCancel }: { onSubmit: (entry: { mood: MoodTag; stressLevel: number; note: string; tags: string[] }) => void; onCancel: () => void }) {
  const [selectedMood, setSelectedMood] = useState<MoodTag | null>(null)
  const [note, setNote] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [stressLevel, setStressLevel] = useState(50)
  const { stressScore } = useStress()

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )
  }

  const handleSubmit = () => {
    if (!selectedMood) return
    onSubmit({
      mood: selectedMood,
      stressLevel: stressScore,
      note: note.trim() || `Feeling ${selectedMood} right now.`,
      tags: selectedTags,
    })
  }

  return (
    <Animated.View entering={FadeIn.duration(300)} style={formStyles.container}>
      <Card style={formStyles.card}>
        <Text style={formStyles.formTitle}>How are you feeling?</Text>

        {/* Mood Grid */}
        <View style={formStyles.moodGrid}>
          {ALL_MOODS.map(mood => (
            <Pressable
              key={mood}
              onPress={() => setSelectedMood(mood)}
              style={[
                formStyles.moodChip,
                selectedMood === mood && {
                  backgroundColor: getMoodColor(mood) + '25',
                  borderColor: getMoodColor(mood) + '50',
                },
              ]}
            >
              <Text style={formStyles.moodEmoji}>{getMoodEmoji(mood)}</Text>
              <Text style={[
                formStyles.moodLabel,
                selectedMood === mood && { color: getMoodColor(mood) },
              ]}>{mood}</Text>
            </Pressable>
          ))}
        </View>

        {/* Note Input */}
        <Text style={formStyles.fieldLabel}>WHAT'S ON YOUR MIND?</Text>
        <TextInput
          style={formStyles.textInput}
          placeholder="Write about what's causing stress or what's going well..."
          placeholderTextColor={TEXT_TERTIARY}
          multiline
          numberOfLines={3}
          value={note}
          onChangeText={setNote}
          textAlignVertical="top"
        />

        {/* Tags */}
        <Text style={formStyles.fieldLabel}>TAGS</Text>
        <View style={formStyles.tagGrid}>
          {QUICK_TAGS.map(tag => (
            <Pressable
              key={tag}
              onPress={() => toggleTag(tag)}
              style={[
                formStyles.tagChip,
                selectedTags.includes(tag) && {
                  backgroundColor: ACCENT + '20',
                  borderColor: ACCENT + '40',
                },
              ]}
            >
              <Text style={[
                formStyles.tagText,
                selectedTags.includes(tag) && { color: ACCENT },
              ]}>{tag}</Text>
            </Pressable>
          ))}
        </View>

        {/* Buttons */}
        <View style={formStyles.buttonRow}>
          <Pressable onPress={onCancel} style={formStyles.cancelBtn}>
            <Text style={formStyles.cancelText}>Cancel</Text>
          </Pressable>
          <Pressable
            onPress={handleSubmit}
            disabled={!selectedMood}
            style={[
              formStyles.submitBtn,
              !selectedMood && { opacity: 0.4 },
            ]}
          >
            <Text style={formStyles.submitText}>Save Entry</Text>
          </Pressable>
        </View>
      </Card>
    </Animated.View>
  )
}

const formStyles = StyleSheet.create({
  container: { gap: 12 },
  card: { padding: 20, gap: 16 },
  formTitle: { fontSize: 18, fontWeight: '800', color: TEXT_PRIMARY, letterSpacing: -0.3 },
  moodGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  moodChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: BORDER,
  },
  moodEmoji: { fontSize: 18 },
  moodLabel: { fontSize: 12, color: TEXT_SECONDARY, fontWeight: '600', textTransform: 'capitalize' },
  fieldLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: TEXT_TERTIARY,
    letterSpacing: 0.8,
  },
  textInput: {
    backgroundColor: SURFACE2,
    borderRadius: 12,
    padding: 14,
    color: TEXT_PRIMARY,
    fontSize: 14,
    minHeight: 80,
    borderWidth: 1,
    borderColor: BORDER,
    fontFamily: 'Inter_400Regular',
  },
  tagGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tagChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: BORDER,
  },
  tagText: { fontSize: 11, color: TEXT_SECONDARY, fontWeight: '600' },
  buttonRow: { flexDirection: 'row', gap: 10, marginTop: 4 },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: BORDER,
  },
  cancelText: { fontSize: 14, color: TEXT_SECONDARY, fontWeight: '600' },
  submitBtn: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: ACCENT + '20',
    borderWidth: 1,
    borderColor: ACCENT + '40',
  },
  submitText: { fontSize: 14, color: ACCENT, fontWeight: '700' },
})

// ─── Journal Entry Item ──────────────────────────────────────────────────────

function JournalEntryCard({ entry, onDelete }: { entry: JournalEntry; onDelete: () => void }) {
  const stressColor = getStressColor(entry.stressLevel)
  const moodColor = getMoodColor(entry.mood)

  const timeAgo = useMemo(() => {
    const diff = Date.now() - entry.timestamp
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    if (hours < 1) return 'Just now'
    if (hours < 24) return `${hours}h ago`
    if (days === 1) return 'Yesterday'
    return `${days} days ago`
  }, [entry.timestamp])

  const dateStr = useMemo(() => {
    const d = new Date(entry.timestamp)
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  }, [entry.timestamp])

  return (
    <Card style={entryStyles.card}>
      <View style={entryStyles.topRow}>
        <View style={[entryStyles.moodBadge, { backgroundColor: moodColor + '18', borderColor: moodColor + '30' }]}>
          <Text style={entryStyles.moodEmoji}>{getMoodEmoji(entry.mood)}</Text>
          <Text style={[entryStyles.moodText, { color: moodColor }]}>{entry.mood}</Text>
        </View>
        <View style={entryStyles.metaCol}>
          <Text style={entryStyles.dateText}>{dateStr}</Text>
          <Text style={entryStyles.timeText}>{timeAgo}</Text>
        </View>
      </View>

      <Text style={entryStyles.noteText}>{entry.note}</Text>

      <View style={entryStyles.bottomRow}>
        <View style={entryStyles.tagsRow}>
          {entry.tags.map(tag => (
            <View key={tag} style={entryStyles.tag}>
              <Text style={entryStyles.tagLabel}>#{tag}</Text>
            </View>
          ))}
        </View>
        <View style={[entryStyles.stressBadge, { borderColor: stressColor + '30' }]}>
          <View style={[entryStyles.stressDot, { backgroundColor: stressColor }]} />
          <Text style={[entryStyles.stressText, { color: stressColor }]}>{entry.stressLevel}</Text>
        </View>
      </View>
    </Card>
  )
}

const entryStyles = StyleSheet.create({
  card: { padding: 14, gap: 10 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  moodBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
  },
  moodEmoji: { fontSize: 16 },
  moodText: { fontSize: 12, fontWeight: '700', textTransform: 'capitalize' },
  metaCol: { alignItems: 'flex-end', gap: 1 },
  dateText: { fontSize: 12, color: TEXT_SECONDARY, fontWeight: '600' },
  timeText: { fontSize: 11, color: TEXT_TERTIARY },
  noteText: { fontSize: 13.5, color: TEXT_PRIMARY, lineHeight: 21, fontWeight: '500' },
  bottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, flex: 1 },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  tagLabel: { fontSize: 10, color: TEXT_TERTIARY, fontWeight: '600' },
  stressBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  stressDot: { width: 6, height: 6, borderRadius: 3 },
  stressText: { fontSize: 11, fontWeight: '700' },
})

// ─── Main Journal Screen ─────────────────────────────────────────────────────

export default function JournalScreen() {
  const insets = useSafeAreaInsets()
  const [showForm, setShowForm] = useState(false)
  const { journalEntries, addJournalEntry, deleteJournalEntry, stressScore } = useStress()

  const handleSubmit = (entry: { mood: MoodTag; stressLevel: number; note: string; tags: string[] }) => {
    addJournalEntry(entry)
    setShowForm(false)
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={{ flex: 1, backgroundColor: BG }}
        contentContainerStyle={[s.container, { paddingTop: insets.top + 16, paddingBottom: TAB_BAR_CLEARANCE + 16 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={s.header}>
          <View>
            <Text style={s.title}>Stress Journal</Text>
            <Text style={s.subtitle}>Track your moods and identify patterns</Text>
          </View>
          {!showForm && (
            <Pressable
              onPress={() => setShowForm(true)}
              style={s.addBtn}
            >
              <Text style={s.addBtnText}>+ New Entry</Text>
            </Pressable>
          )}
        </View>

        {/* Current stress banner */}
        <Card style={[s.currentStressCard, { borderLeftColor: getStressColor(stressScore) }]}>
          <View style={s.currentStressRow}>
            <View>
              <Text style={s.currentStressLabel}>Current Stress</Text>
              <Text style={[s.currentStressValue, { color: getStressColor(stressScore) }]}>{stressScore}/100</Text>
            </View>
            <Text style={s.currentStressHint}>Tap "+ New Entry" to log how you feel</Text>
          </View>
        </Card>

        {/* New Entry Form */}
        {showForm && (
          <NewEntryForm
            onSubmit={handleSubmit}
            onCancel={() => setShowForm(false)}
          />
        )}

        {/* Journal Entries */}
        <Text style={s.sectionTitle}>RECENT ENTRIES ({journalEntries.length})</Text>
        {journalEntries.length === 0 ? (
          <Card style={s.emptyCard}>
            <Text style={s.emptyIcon}>📝</Text>
            <Text style={s.emptyTitle}>No entries yet</Text>
            <Text style={s.emptyText}>Start tracking your stress and moods to identify patterns.</Text>
          </Card>
        ) : (
          journalEntries.map(entry => (
            <JournalEntryCard
              key={entry.id}
              entry={entry}
              onDelete={() => deleteJournalEntry(entry.id)}
            />
          ))
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  container: { paddingHorizontal: 20, gap: 12 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    alignItems: 'flex-start',
  },
  title: { fontSize: 24, fontWeight: '800', color: TEXT_PRIMARY, letterSpacing: -0.5 },
  subtitle: { marginTop: 3, fontSize: 13, color: TEXT_SECONDARY },
  addBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: ACCENT + '18',
    borderWidth: 1,
    borderColor: ACCENT + '35',
  },
  addBtnText: { fontSize: 13, color: ACCENT, fontWeight: '700' },
  currentStressCard: {
    padding: 14,
    borderLeftWidth: 3,
  },
  currentStressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  currentStressLabel: { fontSize: 11, color: TEXT_TERTIARY, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.4 },
  currentStressValue: { fontSize: 24, fontWeight: '800', letterSpacing: -0.5 },
  currentStressHint: { fontSize: 11, color: TEXT_TERTIARY, textAlign: 'right', maxWidth: 140 },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: TEXT_TERTIARY,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginTop: 4,
  },
  emptyCard: { alignItems: 'center', gap: 8, padding: 32 },
  emptyIcon: { fontSize: 36 },
  emptyTitle: { fontSize: 16, color: TEXT_PRIMARY, fontWeight: '700' },
  emptyText: { fontSize: 13, color: TEXT_SECONDARY, textAlign: 'center', lineHeight: 20 },
})
