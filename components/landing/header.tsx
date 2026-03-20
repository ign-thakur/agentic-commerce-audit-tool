"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border/50 ">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <Image
             src="/logo.png"
            alt="GreenHonchos"
            width={180}
            height={40}
            className="h-10 w-auto"
            unoptimized
          />
        </Link>
        <nav className="flex items-center gap-8">
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
            className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
            asChild
          >
            <Link href="https://www.greenhonchos.com" target="_blank" rel="noopener noreferrer">
              Visit GreenHonchos
            </Link>
          </Button>
        </nav>
      </div>
    </header>
  )
}
