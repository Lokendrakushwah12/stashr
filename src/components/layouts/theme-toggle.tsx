'use client'

import { useTheme } from 'next-themes'
import { Button } from '../ui/button'
import { ThemeToggleIcon } from '../ui/icons'

export function ThemeToggle() {
  const { setTheme } = useTheme()

  return (
    <Button
      data-slot="button"
      onClick={() => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))}
      className="relative size-9 p-0"
      variant="ghost"
      aria-label="Toggle theme"
      title="Toggle theme"
    >
      <ThemeToggleIcon />
    </Button>
  )
}