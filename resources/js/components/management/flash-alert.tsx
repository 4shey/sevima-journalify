import { usePage } from "@inertiajs/react"
import { CircleAlertIcon, CircleCheckIcon } from "lucide-react"

import { cn } from "cn"

export function FlashAlert() {
  const { props } = usePage()
  const flash = props.flash

  if (!flash?.success && !flash?.error) {
    return null
  }

  const isSuccess = Boolean(flash.success)

  return (
    <div
      role="status"
      className={cn(
        "flex items-center gap-2 rounded-lg border px-4 py-3 text-sm",
        isSuccess
          ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
          : "border-destructive/40 bg-destructive/10 text-destructive"
      )}
    >
      {isSuccess ? (
        <CircleCheckIcon className="size-4 shrink-0" />
      ) : (
        <CircleAlertIcon className="size-4 shrink-0" />
      )}
      <span>{isSuccess ? flash.success : flash.error}</span>
    </div>
  )
}
