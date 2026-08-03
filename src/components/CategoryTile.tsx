import type { Category } from '@/data/mockData'
import { getCategoryIcon } from '@/lib/categoryIcons'

interface Props {
  category: Category
  selected?: boolean
  onClick?: () => void
  size?: 'sm' | 'md'
}

export default function CategoryTile({ category, selected = false, onClick, size = 'md' }: Props) {
  const Icon = getCategoryIcon(category.id)

  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-2 rounded-2xl border-2 font-medium transition-all duration-200 select-none ${
        size === 'sm'
          ? 'p-3 text-xs'
          : 'p-4 text-sm'
      } ${
        selected
          ? 'border-amber bg-amber/10 shadow-sm scale-[0.98]'
          : 'border-sand dark:border-white/10 bg-white dark:bg-navy-surface hover:border-amber/40 hover:bg-amber/5'
      }`}
      style={selected ? { borderColor: '#E8A838', backgroundColor: '#E8A83812' } : {}}
    >
      <Icon size={size === 'sm' ? 18 : 22} style={{ color: category.color }} />
      <span className={`text-gray-800 dark:text-gray-200 font-medium leading-tight text-center ${size === 'sm' ? 'text-xs' : 'text-sm'}`}>
        {category.name}
      </span>
    </button>
  )
}
