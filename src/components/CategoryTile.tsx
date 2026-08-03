import type { Category } from '@/data/mockData'

interface Props {
  category: Category
  selected?: boolean
  onClick?: () => void
  size?: 'sm' | 'md'
}

export default function CategoryTile({ category, selected = false, onClick, size = 'md' }: Props) {
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
      <span className={size === 'sm' ? 'text-xl' : 'text-2xl'} role="img" aria-label={category.name}>
        {category.emoji}
      </span>
      <span className={`text-gray-800 dark:text-gray-200 font-medium leading-tight text-center ${size === 'sm' ? 'text-xs' : 'text-sm'}`}>
        {category.name}
      </span>
    </button>
  )
}
