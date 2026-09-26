import type { ReactNode } from "react"

import { cn } from "cn"

export function DataTableCard({
  toolbar,
  footer,
  children,
  className,
}: {
  toolbar?: ReactNode
  footer?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden rounded-xl border",
        className,
      )}
    >
      {toolbar ? (
        <div className="flex flex-col gap-3 border-b px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          {toolbar}
        </div>
      ) : null}
      <div className="min-w-0">{children}</div>
      {footer ? <div className="border-t px-4 py-3">{footer}</div> : null}
    </div>
  )
}
