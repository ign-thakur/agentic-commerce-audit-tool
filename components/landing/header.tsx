"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border/50 ">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:h-20 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <Image
             src="/logo.png"
            alt="GreenHonchos"
            width={180}
            height={40}
            className="h-7 w-auto sm:h-10"
            unoptimized
          />
        </Link>
        <nav className="flex items-center gap-4 sm:gap-8">
          <Link 
            href="#how-it-works" 
            className="hidden text-sm font-medium text-foreground/70 transition-colors hover:text-primary md:block"
          >
            How it Works
          </Link>
          <Link 
            href="#features" 
            className="hidden text-sm font-medium text-foreground/70 transition-colors hover:text-primary md:block"
          >
            Features
          </Link>
          <Button 
            size="sm"
            className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
            asChild
          >
            <Link href="https://www.greenhonchos.com" target="_blank" rel="noopener noreferrer">
              <span className="hidden sm:inline">Visit GreenHonchos</span>
              <span className="sm:hidden">Visit</span>
            </Link>
          </Button>
        </nav>
      </div>
    </header>
  )
}
