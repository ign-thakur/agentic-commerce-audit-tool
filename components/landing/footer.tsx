import Link from "next/link"
import Image from "next/image"

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30 py-6">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-8 sm:flex-row items-end justify-end">

          <p className="text-sm text-muted-foreground">
            {new Date().getFullYear()} GreenHonchos Solutions Pvt. Ltd. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}