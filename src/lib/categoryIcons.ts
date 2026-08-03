import {
  Music, Newspaper, Landmark, Trophy, TrendingUp,
  FlaskConical, Cpu, Palette, Brain, Rocket,
  BookOpen, Leaf, Utensils, Lightbulb, Globe, Map,
  type LucideIcon,
} from 'lucide-react'

export const categoryIcons: Record<string, LucideIcon> = {
  music:      Music,
  news:       Newspaper,
  history:    Landmark,
  sports:     Trophy,
  finance:    TrendingUp,
  science:    FlaskConical,
  technology: Cpu,
  art:        Palette,
  psychology: Brain,
  space:      Rocket,
  language:   BookOpen,
  nature:     Leaf,
  food:       Utensils,
  philosophy: Lightbulb,
  culture:    Globe,
  geography:  Map,
}

export function getCategoryIcon(categoryId: string): LucideIcon {
  return categoryIcons[categoryId] ?? BookOpen
}
