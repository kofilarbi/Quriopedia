import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Bookmark, BookmarkCheck, Share2, ChevronDown, ChevronUp } from 'lucide-react'
import type { KnowledgeCard as KnowledgeCardType, Category } from '@/data/mockData'
import { categories } from '@/data/mockData'
import { useAppStore } from '@/store/useAppStore'

interface Props {
  card: KnowledgeCardType
  showBookmark?: boolean
}

const typeBadgeColors: Record<KnowledgeCardType['type'], string> = {
  fact: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  vocab: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  insight: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
}

const typeLabels: Record<KnowledgeCardType['type'], string> = {
  fact: 'Fact',
  vocab: 'Vocab',
  insight: 'Insight',
}

export default function KnowledgeCard({ card, showBookmark = false }: Props) {
  const [expanded, setExpanded] = useState(false)
  const { bookmarks, toggleBookmark } = useAppStore()
  const isBookmarked = bookmarks.includes(card.id)
  const category = categories.find((c: Category) => c.id === card.categoryId)

  return (
    <motion.article
      layout
      className="bg-white dark:bg-navy-surface rounded-2xl shadow-sm border border-sand dark:border-white/10 overflow-hidden"
    >
      <div className="p-4">
        {/* Header row */}
        <div className="flex items-center gap-2 mb-3">
          {category && (
            <span
              className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border"
              style={{
                backgroundColor: `${category.color}18`,
                borderColor: `${category.color}40`,
                color: category.color,
              }}
            >
              <span>{category.emoji}</span>
              <span>{category.name}</span>
            </span>
          )}
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${typeBadgeColors[card.type]}`}>
            {typeLabels[card.type]}
          </span>
        </div>

        {/* Headline */}
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50 leading-snug mb-2">
          {card.headline}
        </h2>

        {/* Body */}
        <p className="text-sm text-warmGray dark:text-gray-400 leading-relaxed line-clamp-3">
          {card.body}
        </p>

        {/* Read more button */}
        <button
          onClick={() => setExpanded((v) => !v)}
          className="mt-3 flex items-center gap-1 text-sm font-medium text-amber hover:text-amber-dark transition-colors"
        >
          {expanded ? (
            <>
              <ChevronUp size={16} />
              Show less
            </>
          ) : (
            <>
              <ChevronDown size={16} />
              Read more
            </>
          )}
        </button>

        {/* Expandable content */}
        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              key="readmore"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <p className="mt-3 text-sm text-gray-700 dark:text-gray-300 leading-relaxed border-t border-sand dark:border-white/10 pt-3">
                {card.readMore}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 bg-sand/40 dark:bg-white/5 flex items-center justify-between border-t border-sand dark:border-white/10">
        <span className="text-xs text-warmGray dark:text-gray-500">
          {new Date(card.date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </span>
        <div className="flex items-center gap-3">
          <button
            className="text-warmGray hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            onClick={() => {}}
            aria-label="Share"
          >
            <Share2 size={17} />
          </button>
          {showBookmark && (
            <button
              onClick={() => toggleBookmark(card.id)}
              className={`transition-colors ${
                isBookmarked ? 'text-amber' : 'text-warmGray hover:text-amber'
              }`}
              aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark'}
            >
              {isBookmarked ? <BookmarkCheck size={17} /> : <Bookmark size={17} />}
            </button>
          )}
        </div>
      </div>
    </motion.article>
  )
}
