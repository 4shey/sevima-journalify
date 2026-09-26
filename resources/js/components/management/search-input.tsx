import { useEffect, useRef, useState } from "react"
import { SearchIcon } from "lucide-react"

import { Input } from "@/components/ui/input"

export function SearchInput({
  value,
  onSearch,
  placeholder = "Cari...",
}: {
  value: string
  onSearch: (value: string) => void
  placeholder?: string
}) {
  const [local, setLocal] = useState(value)
  const pendingRef = useRef(false)
  const searchRef = useRef(onSearch)

  useEffect(() => {
    searchRef.current = onSearch
  })

  useEffect(() => {
    if (!pendingRef.current) {
      setLocal(value)
    }
  }, [value])

  useEffect(() => {
    if (local === value) {
      return
    }

    pendingRef.current = true
    const timeout = setTimeout(() => {
      pendingRef.current = false
      searchRef.current(local)
    }, 300)

    return () => clearTimeout(timeout)
  }, [local, value])

  return (
    <div className="relative w-full sm:max-w-72">
      <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        className="pl-8"
        placeholder={placeholder}
        value={local}
        onChange={(event) => setLocal(event.target.value)}
      />
    </div>
  )
}
