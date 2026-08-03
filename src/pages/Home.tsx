import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Flame } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import KnowledgeCard from '@/components/KnowledgeCard'
import type { CardDisplay } from '@/components/KnowledgeCard'
import { fetchTodaysEntries } from '@/lib/entryService'
import type { Entry } from '@/lib/entryService'

function entryToCard(entry: Entry): CardDisplay {
  return {
    id: entry.id,
    categoryId: entry.categoryId,
    headline: entry.headline,
    body: entry.body,
    readMore: entry.readMore,
    type: entry.type,
    date: entry.publishedDate,
  }
}

export default function Home() {
  const { name, selectedCategories, streak } = useAppStore()

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ['todayEntries', selectedCategories],
    queryFn: () => fetchTodaysEntries(selectedCategories),
    enabled: selectedCategories.length > 0,
  })

  const cards: CardDisplay[] = entries.map(entryToCard)

  const greeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  const formattedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="px-4 pt-6 pb-28">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-warmGray dark:text-gray-400 text-sm font-medium">{greeting()}</p>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">
              {name ? name : 'Curious mind'} 👋
            </h1>
          </div>
          {streak > 0 && (
            <div className="flex items-center gap-1.5 bg-amber/10 border border-amber/30 px-3 py-2 rounded-xl">
              <Flame size={16} className="text-amber" />
              <span className="text-sm font-semibold text-amber">{streak}</span>
            </div>
          )}
        </div>
      </motion.div>

      {/* Today section header */}
      <div className="flex items-center gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 bg-amber text-white text-xs font-semibold px-2.5 py-1 rounded-full">
              New today
            </span>
          </div>
          <p className="text-sm text-warmGray dark:text-gray-400 mt-1">{formattedDate}</p>
        </div>
      </div>

      {/* Cards */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-48 bg-sand dark:bg-navy-surface rounded-2xl animate-pulse"
            />
          ))}
        </div>
      ) : cards.length > 0 ? (
        <div className="space-y-4">
          {cards.map((card: CardDisplay, i: number) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <KnowledgeCard card={card} showBookmark />
            </motion.div>
          ))}
        </div>
      ) : (
        <EmptyState selectedCount={selectedCategories.length} />
      )}
    </div>
  )
}

function EmptyState({ selectedCount }: { selectedCount: number }) {
  return (
    <div className="text-center py-16">
      <p className="text-4xl mb-4">📚</p>
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
        Nothing here yet
      </h3>
      <p className="text-sm text-warmGray dark:text-gray-400">
        {selectedCount === 0
          ? 'Head to your profile to pick some topics.'
          : 'New cards arrive daily. Check back tomorrow!'}
      </p>
    </div>
  )
}
