import { router } from "@inertiajs/react"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import type { Paginated } from "@/types"

export function Pagination({
  paginator,
}: {
  paginator: Paginated<unknown>
}) {
  if (paginator.last_page <= 1) {
    return (
      <p className="text-sm text-muted-foreground">
        {paginator.total} data
      </p>
    )
  }

  const go = (url: string | null) => {
    if (!url) {
      return
    }

    router.get(url, {}, { preserveState: true, preserveScroll: true, replace: true })
  }

  const previous = paginator.links[0]
  const next = paginator.links[paginator.links.length - 1]
  const pages = paginator.links.slice(1, -1)

  return (
    <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
      <p className="text-sm text-muted-foreground">
        Halaman {paginator.current_page} dari {paginator.last_page} —{" "}
        {paginator.total} data
      </p>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          disabled={!previous?.url}
          onClick={() => go(previous?.url ?? null)}
        >
          <ChevronLeftIcon />
          Sebelumnya
        </Button>
        {pages.map((link) => (
          <Button
            key={link.label}
            variant={link.active ? "default" : "outline"}
            size="sm"
            onClick={() => go(link.url)}
          >
            {Number(link.label)}
          </Button>
        ))}
        <Button
          variant="outline"
          size="sm"
          disabled={!next?.url}
          onClick={() => go(next?.url ?? null)}
        >
          Berikutnya
          <ChevronRightIcon />
        </Button>
      </div>
    </div>
  )
}
