export function Footer() {
  return (
    <footer className="w-full p-6 text-center text-sm text-muted-foreground bg-background/50 border-t border-border mt-auto">
      <p>&copy; {new Date().getFullYear()} critterFX. All rights reserved.</p>
    </footer>
  )
}