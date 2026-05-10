export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30 py-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center sm:justify-end">

          <p className="text-center text-xs text-muted-foreground sm:text-right sm:text-sm">
            {new Date().getFullYear()} GreenHonchos Solutions Pvt. Ltd. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}