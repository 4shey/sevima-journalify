export { cn } from "cn"

export function rowNumber(
  paginator: { current_page: number; per_page: number },
  index: number,
): number {
  return (paginator.current_page - 1) * paginator.per_page + index + 1
}
