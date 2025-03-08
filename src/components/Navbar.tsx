'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ModeToggle } from '@/components/ui/mode-toggle'
import { Menu } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetTrigger
} from '@/components/ui/sheet'

export function Navbar() {
  const pathname = usePathname()
  
  const routes = [
    {
      href: '/',
      label: 'Home',
      active: pathname === '/'
    },
    {
      href: '/cv',
      label: 'CV Generator',
      active: pathname === '/cv'
    },
    {
      href: '/about',
      label: 'About',
      active: pathname === '/about'
    }
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6 mx-auto">
        <div className="max-w-7xl w-full mx-auto flex items-center justify-between">
          {/* Logo and Desktop Navigation */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center space-x-2">
              <span className="font-bold text-xl bg-gradient-to-r from-primary to-primary/70 text-transparent bg-clip-text">CV Builder</span>
            </Link>
            <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
              {routes.map((route) => (
                <Link
                  key={route.href}
                  href={route.href}
                  className={`transition-colors hover:text-foreground/80 ${
                    route.active ? 'text-foreground' : 'text-foreground/60'
                  }`}
                >
                  {route.label}
                </Link>
              ))}
            </nav>
          </div>
          
          {/* Mobile Menu */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="pr-0">
                <div className="flex flex-col gap-8">
                  <Link href="/" className="flex items-center space-x-2">
                    <span className="font-bold text-xl bg-gradient-to-r from-primary to-primary/70 text-transparent bg-clip-text">CV Builder</span>
                  </Link>
                  <nav className="flex flex-col space-y-4">
                    {routes.map((route) => (
                      <Link
                        key={route.href}
                        href={route.href}
                        className={`text-sm font-medium transition-colors hover:text-foreground/80 ${
                          route.active ? 'text-foreground' : 'text-foreground/60'
                        }`}
                      >
                        {route.label}
                      </Link>
                    ))}
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>
          
          {/* Right Side Actions */}
          <div className="flex items-center gap-4">
            <ModeToggle />
            <Button asChild className="hidden md:flex">
              <Link href="/cv">Get Started</Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
} 