import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import type { Category, KnowledgeCard as KnowledgeCardType } from '@/data/mockData'
import { categories, knowledgeCards } from '@/data/mockData'
import CategoryTile from '@/components/CategoryTile'
import KnowledgeCard from '@/components/KnowledgeCard'

export default function Explore() {
  const { categoryId } = useParams<{ categoryId?: string }>()

  if (categoryId) {
    return <CategoryFeed categoryId={categoryId} />
  }

  return <CategoryGrid />
}

function CategoryGrid() {
  const navigate = useNavigate()

  return (
    <div className="px-4 pt-6 pb-28">
      <motion.h1
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl font-bold text-gray-900 dark:text-gray-50 mb-1"
      >
        Explore topics
      </motion.h1>
      <p className="text-sm text-warmGray dark:text-gray-400 mb-6">
        Dive into any subject that sparks your curiosity.
      </p>

      <div className="grid grid-cols-2 gap-3">
        {categories.map((cat: Category, i: number) => (
          <motion.div
            key={cat.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.04 }}
          >
            <CategoryTile
              category={cat}
              onClick={() => navigate(`/explore/${cat.id}`)}
            />
          </motion.div>
        ))}
      </div>
    </div>
  )
}

function CategoryFeed({ categoryId }: { categoryId: string }) {
  const navigate = useNavigate()
  const category = categories.find((c: Category) => c.id === categoryId)
  const cards = knowledgeCards.filter((c: KnowledgeCardType) => c.categoryId === categoryId)

  if (!category) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-warmGray">Category not found.</p>
      </div>
    )
  }

  return (
    <div className="px-4 pt-4 pb-28">
      {/* Back button */}
      <button
        onClick={() => navigate('/explore')}
        className="flex items-center gap-2 text-warmGray hover:text-gray-700 dark:hover:text-gray-300 transition-colors mb-5"
      >
        <ArrowLeft size={20} />
        <span className="text-sm font-medium">All topics</span>
      </button>

      {/* Category header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 mb-6"
      >
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl"
          style={{ backgroundColor: `${category.color}18`, border: `2px solid ${category.color}40` }}
        >
          {category.emoji}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">{category.name}</h1>
          <p className="text-sm text-warmGray dark:text-gray-400">{cards.length} cards</p>
        </div>
      </motion.div>

      {/* Cards */}
      {cards.length > 0 ? (
        <div className="space-y-4">
          {cards.map((card: KnowledgeCardType, i: number) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
            >
              <KnowledgeCard card={card} showBookmark />
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-4xl mb-4">{category.emoji}</p>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
            No cards yet
          </h3>
          <p className="text-sm text-warmGray dark:text-gray-400">
            More content is coming soon for this topic.
          </p>
        </div>
      )}
    </div>
  )
}
