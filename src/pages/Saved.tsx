import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Bookmark } from 'lucide-react'
import type { Category } from '@/data/mockData'
import { categories } from '@/data/mockData'
import { useAppStore } from '@/store/useAppStore'
import KnowledgeCard from '@/components/KnowledgeCard'
import type { CardDisplay } from '@/components/KnowledgeCard'
import { fetchEntriesByIds } from '@/lib/entryService'
import type { Entry } from '@/lib/entryService'
import { getCategoryIcon } from '@/lib/categoryIcons'

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

export default function Saved() {
  const { bookmarks } = useAppStore()
  const [activeCategory, setActiveCategory] = useState<string>('all')

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ['savedEntries', bookmarks],
    queryFn: () => fetchEntriesByIds(bookmarks),
    enabled: bookmarks.length > 0,
  })

  const savedCards: CardDisplay[] = entries.map(entryToCard)

  const savedCategoryIds = [...new Set(savedCards.map((c: CardDisplay) => c.categoryId))]
  const savedCategories = categories.filter((c: Category) => savedCategoryIds.includes(c.id))

  const filtered =
    activeCategory === 'all'
      ? savedCards
      : savedCards.filter((c: CardDisplay) => c.categoryId === activeCategory)

  return (
    <div className="px-4 pt-6 pb-28">
      <motion.h1
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl font-bold text-gray-900 dark:text-gray-50 mb-5"
      >
        Bookmarks
      </motion.h1>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-48 bg-sand dark:bg-navy-surface rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : savedCards.length === 0 ? (
        <EmptyBookmarks />
      ) : (
        <>
          {/* Category filter pills */}
          {savedCategories.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2 mb-5 scrollbar-hide">
              <button
                onClick={() => setActiveCategory('all')}
                className={`flex-shrink-0 text-sm font-medium px-3.5 py-1.5 rounded-full border transition-colors ${
                  activeCategory === 'all'
                    ? 'bg-amber text-white border-amber'
                    : 'bg-white dark:bg-navy-surface border-sand dark:border-white/10 text-warmGray dark:text-gray-400 hover:border-amber/40'
                }`}
              >
                All ({savedCards.length})
              </button>
              {savedCategories.map((cat: Category) => {
                const count = savedCards.filter((c: CardDisplay) => c.categoryId === cat.id).length
                const CatIcon = getCategoryIcon(cat.id)
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`flex-shrink-0 flex items-center gap-1.5 text-sm font-medium px-3.5 py-1.5 rounded-full border transition-colors ${
                      activeCategory === cat.id
                        ? 'bg-amber text-white border-amber'
                        : 'bg-white dark:bg-navy-surface border-sand dark:border-white/10 text-warmGray dark:text-gray-400 hover:border-amber/40'
                    }`}
                  >
                    <CatIcon size={12} />
                    <span>{cat.name}</span>
                    <span className="opacity-60">({count})</span>
                  </button>
                )
              })}
            </div>
          )}

          {/* Cards */}
          <div className="space-y-4">
            {filtered.map((card: CardDisplay, i: number) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
              >
                <KnowledgeCard card={card} showBookmark />
              </motion.div>
            ))}
            {filtered.length === 0 && (
              <p className="text-center text-warmGray dark:text-gray-400 py-10 text-sm">
                No saved cards in this category.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  )
}

function EmptyBookmarks() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-24 text-center"
    >
      <div className="w-20 h-20 rounded-2xl bg-sand dark:bg-navy-surface border-2 border-sand dark:border-white/10 flex items-center justify-center mb-6">
        <Bookmark size={32} className="text-warmGray" />
      </div>
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
        Nothing saved yet
      </h3>
      <p className="text-sm text-warmGray dark:text-gray-400 max-w-xs">
        Tap the bookmark icon on any card to save it here for later.
      </p>
    </motion.div>
  )
}
