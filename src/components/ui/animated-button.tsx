'use client'

import { ReactNode } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AnimatedButtonProps {
  href: string
  children: ReactNode
  variant?: 'default' | 'secondary' | 'outline'
  size?: 'default' | 'sm' | 'lg'
  className?: string
  icon?: boolean
}

export function AnimatedButton({
  href,
  children,
  variant = 'default',
  size = 'default',
  className,
  icon = true
}: AnimatedButtonProps) {
  return (
    <Button
      asChild
      variant={variant}
      size={size}
      className={cn('group', className)}
    >
      <Link href={href}>
        {children}
        {icon && (
          <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
        )}
      </Link>
    </Button>
  )
} 