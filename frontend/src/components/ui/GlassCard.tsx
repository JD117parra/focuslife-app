import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface GlassCardProps {
  children: ReactNode
  className?: string
  variant?: 'default' | 'header' | 'sidebar' | 'content'
  hover?: boolean
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
}

export function GlassCard({ 
  children, 
  className = '', 
  variant = 'default',
  hover = true,
  padding = 'md',
  shadow = 'lg'
}: GlassCardProps) {
  const baseClasses = 'backdrop-blur-md border border-white/20 rounded-lg transition-all duration-300'
  
  const variantClasses = {
    default: 'bg-white/10',
    header: 'bg-blue-900/95 border-blue-800',
    sidebar: 'bg-white/5',
    content: 'bg-white/10'
  }
  
  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-6', 
    lg: 'p-8',
    xl: 'p-12'
  }
  
  const shadowClasses = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl'
  }
  
  const hoverClasses = hover ? 'hover:shadow-xl hover:border-white/40 hover:bg-white/15' : ''
  
  return (
    <div className={cn(
      baseClasses,
      variantClasses[variant],
      paddingClasses[padding],
      shadowClasses[shadow],
      hoverClasses,
      className
    )}>
      {children}
    </div>
  )
}

export default GlassCard