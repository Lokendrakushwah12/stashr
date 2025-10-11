'use client'

import { useTheme } from 'next-themes'
import { Button } from '../ui/button'
import { ThemeToggleIcon } from '../ui/icons'
import { cn } from '@/lib/utils'

export function ThemeToggle({ className = "", title }: { className?: string, title?: string }) {
  const { setTheme } = useTheme()

  return (
    <Button
      data-slot="button"
      onClick={() => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))}
      className={cn("relative justify-start", className)}
      variant="ghost"
      aria-label="Toggle theme"
      title={title}
    >
      <ThemeToggleIcon />
      {title && (
        <span className="">{title}</span>
      )}
    </Button>
  )
}