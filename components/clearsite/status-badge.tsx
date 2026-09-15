import type { CellStatus } from '@/lib/clearsite-data'
import { STATUS_META } from '@/lib/clearsite-data'

export function StatusBadge({ status }: { status: CellStatus }) {
  const meta = STATUS_META[status]
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium"
      style={{ backgroundColor: meta.bg, color: meta.fg }}
    >
      <span className="size-1.5 rounded-full" style={{ backgroundColor: meta.fg }} aria-hidden />
      {meta.label}
    </span>
  )
}

export function StatDot({ status }: { status: CellStatus }) {
  const meta = STATUS_META[status]
  return <span className="size-2.5 rounded-full" style={{ backgroundColor: meta.fg }} aria-hidden />
}
