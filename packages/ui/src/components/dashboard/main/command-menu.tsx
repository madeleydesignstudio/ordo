import React from 'react'
import { useHotkeys } from "react-hotkeys-hook"
import { useCallback, useState } from "react"
import { useNavigate } from "@tanstack/react-router"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "../../command"
import { Search } from "lucide-react"

interface CommandMenuProps {
  links: {
    title: string
    href?: string
    action?: () => void
    description?: string
  }[]
}

export function CommandMenu({ links }: CommandMenuProps) {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  useHotkeys("meta+k", (e) => {
    e.preventDefault()
    setOpen((open) => !open)
  })

  const runCommand = useCallback((command: () => unknown) => {
    setOpen(false)
    command()
  }, [])

  // Group links by their manager type or 'General' for actions/settings
  const groupedLinks = links.reduce<Record<string, typeof links>>((acc, link) => {
    let group = 'General'
    if (link.href) {
      const parts = link.href.split('/')
      if (parts.length >= 2 && typeof parts[1] === 'string' && parts[1].includes('manager')) {
        group = parts[1]!
      }
    }
    if (!acc[group]) {
      acc[group] = []
    }
    (acc[group] ?? []).push(link)
    return acc
  }, {})

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 w-9 p-0"
      >
        <Search className="h-4 w-4 text-stone-400" />
        <span className="sr-only">Search</span>
      </button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          {Object.entries(groupedLinks).map(([manager, links], index) => (
            <React.Fragment key={manager}>
              {index > 0 && <CommandSeparator />}
              <CommandGroup heading={manager.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}>
                {links.map((link) => (
                  <CommandItem
                    key={link.href || link.title}
                    onSelect={() => {
                      setOpen(false)
                      if (link.action) link.action()
                      else if (link.href) runCommand(() => navigate({ to: link.href }))
                    }}
                  >
                    {link.title}
                    {link.description && (
                      <span className="ml-2 text-muted-foreground">
                        {link.description}
                      </span>
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            </React.Fragment>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  )
} 