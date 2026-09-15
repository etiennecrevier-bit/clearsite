'use client'

import { useState } from 'react'
import { Check, Info, X } from 'lucide-react'
import {
  DAYS_IN_MONTH,
  GRID,
  HOLIDAYS,
  MONTH_LABEL,
  REGIME_LABELS,
  SITES,
  STATUS_META,
  TODAY_DAY,
  getCell,
  getEmployee,
  type CellStatus,
} from '@/lib/clearsite-data'
import { cn } from '@/lib/utils'

const WEEKDAY_LETTER = ['D', 'L', 'M', 'M', 'J', 'V', 'S']

function weekday(day: number): number {
  return new Date(2026, 8, day).getDay()
}

// Rendu robuste du marqueur d'une case (icônes plutôt que glyphes Unicode fragiles).
function Mark({ status }: { status: CellStatus }) {
  switch (status) {
    case 'recue':
      return <Check className="size-3.5" strokeWidth={3} />
    case 'manquante':
      return <X className="size-3.5" strokeWidth={3} />
    case 'anomalie':
      return <span aria-hidden>!</span>
    case 'excusee':
      return <span className="text-[10px]" aria-hidden>exc</span>
    case 'attendue':
      return <span className="size-2 rounded-full border-2 border-current" aria-hidden />
    case 'ferie':
      return <span aria-hidden>F</span>
    case 'non_requis':
      return <span className="opacity-40" aria-hidden>·</span>
    default:
      return null
  }
}

const LEGEND: { status: CellStatus; note?: string }[] = [
  { status: 'recue' },
  { status: 'anomalie', note: 'commentaire' },
  { status: 'manquante' },
  { status: 'excusee' },
  { status: 'attendue' },
  { status: 'non_requis', note: 'régime / fin de semaine' },
  { status: 'ferie' },
]

export function MonthGridView({ onOpenProof }: { onOpenProof: (id: string) => void }) {
  const [hover, setHover] = useState<string | null>(null)
  const days = Array.from({ length: DAYS_IN_MONTH }, (_, i) => i + 1)

  const total = GRID.length
  const recues = GRID.filter((c) => c.status === 'recue').length
  const anomalies = GRID.filter((c) => c.status === 'anomalie').length
  const manquantes = GRID.filter((c) => c.status === 'manquante').length

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-balance text-xl font-semibold tracking-tight">Grille du mois — {MONTH_LABEL}</h2>
          <p className="text-sm text-muted-foreground">
            La feuille 8½ × 11 qui se coche toute seule. Une ligne par bâtiment, une colonne par journée.
          </p>
        </div>
        <div className="flex gap-4 font-mono text-xs text-muted-foreground">
          <span><strong className="text-foreground">{recues}</strong> reçues</span>
          <span><strong className="text-[var(--cell-anomalie-fg)]">{anomalies}</strong> anomalies</span>
          <span><strong className="text-[var(--cell-manquante-fg)]">{manquantes}</strong> manquantes</span>
          <span className="text-muted-foreground/70">/ {total} cases</span>
        </div>
      </div>

      {/* Légende */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-lg border bg-card px-4 py-3 text-xs">
        {LEGEND.map(({ status, note }) => {
          const meta = STATUS_META[status]
          return (
            <span key={status} className="inline-flex items-center gap-1.5">
              <span
                className="flex size-4 items-center justify-center rounded-[3px] text-[9px] font-bold"
                style={{ backgroundColor: meta.bg, color: meta.fg }}
              >
                <Mark status={status} />
              </span>
              <span className="text-muted-foreground">
                {meta.label}
                {note && <span className="text-muted-foreground/60"> · {note}</span>}
              </span>
            </span>
          )
        })}
      </div>

      {/* Grille */}
      <div className="overflow-x-auto rounded-lg border bg-card">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr>
              <th className="sticky left-0 z-10 min-w-[220px] border-b border-r bg-card px-3 py-2 text-left font-medium text-muted-foreground">
                Bâtiment
              </th>
              {days.map((d) => {
                const wd = weekday(d)
                const isWeekend = wd === 0 || wd === 6
                const isToday = d === TODAY_DAY
                const isHoliday = Boolean(HOLIDAYS[d])
                return (
                  <th
                    key={d}
                    className={cn(
                      'border-b border-l px-0 py-1 text-center align-middle font-normal',
                      isWeekend && 'bg-[var(--cell-weekend)]',
                      isHoliday && 'bg-[var(--cell-ferie)]',
                    )}
                    style={{ minWidth: 26 }}
                  >
                    <div className={cn('text-[9px] uppercase text-muted-foreground', isToday && 'text-primary')}>
                      {WEEKDAY_LETTER[wd]}
                    </div>
                    <div
                      className={cn(
                        'font-mono text-[11px] tabular-nums',
                        isToday ? 'font-bold text-primary' : 'text-foreground',
                      )}
                    >
                      {d}
                    </div>
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {SITES.map((site) => {
              const emp = getEmployee(site.employeeId)
              return (
                <tr key={site.id} className="group">
                  <th
                    scope="row"
                    className="sticky left-0 z-10 border-b border-r bg-card px-3 py-1.5 text-left font-normal group-hover:bg-accent"
                  >
                    <div className="flex items-center gap-2">
                      <span className="truncate text-[13px] font-medium text-foreground">{site.name}</span>
                      <span className="font-mono text-[10px] text-muted-foreground">{site.transit}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                      <span>{site.client}</span>
                      <span aria-hidden>·</span>
                      <span className="uppercase">{emp?.name.split(' ')[0]}</span>
                    </div>
                  </th>
                  {days.map((d) => {
                    const cell = getCell(site.id, d)!
                    const meta = STATUS_META[cell.status]
                    const key = `${site.id}-${d}`
                    const clickable = Boolean(cell.proofId)
                    const isGuichet = cell.serviceType === 'guichet'
                    return (
                      <td key={d} className="border-b border-l p-0 text-center">
                        <button
                          type="button"
                          disabled={!clickable}
                          onMouseEnter={() => setHover(key)}
                          onMouseLeave={() => setHover((h) => (h === key ? null : h))}
                          onClick={() => cell.proofId && onOpenProof(cell.proofId)}
                          title={`${site.name} · ${d} sept. — ${meta.label}${
                            cell.anomalies?.length ? ' (' + cell.anomalies[0] + ')' : ''
                          }`}
                          className={cn(
                            'flex h-7 w-full items-center justify-center font-mono text-[11px] font-semibold transition-[outline] outline-none',
                            clickable ? 'cursor-pointer' : 'cursor-default',
                            hover === key && clickable && 'outline outline-2 -outline-offset-2 outline-primary',
                          )}
                          style={{
                            backgroundColor: meta.bg,
                            color: meta.fg,
                            boxShadow: isGuichet ? 'inset 0 0 0 2px var(--cell-atm)' : undefined,
                          }}
                        >
                          <Mark status={cell.status} />
                        </button>
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Régimes de service (ce que disaient les couleurs de la feuille) */}
      <div className="rounded-lg border bg-card p-4">
        <h3 className="mb-3 inline-flex items-center gap-2 text-sm font-semibold">
          <Info className="size-4" /> Régimes de service des bâtiments
        </h3>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {SITES.map((site) => (
            <div key={site.id} className="flex items-center justify-between gap-2 rounded-md bg-muted/50 px-3 py-2 text-xs">
              <span className="truncate font-medium">{site.name}</span>
              <span className="shrink-0 text-muted-foreground">{REGIME_LABELS[site.regime]}</span>
            </div>
          ))}
        </div>
        <p className="mt-3 flex items-start gap-1.5 text-xs text-muted-foreground">
          <span
            className="mt-0.5 inline-block size-3 shrink-0 rounded-[2px]"
            style={{ boxShadow: 'inset 0 0 0 2px var(--cell-atm)' }}
            aria-hidden
          />
          Le liseré orange marque le 6<sup>e</sup> jour « guichet » des bâtiments en régime 5 jours + ATM.
        </p>
      </div>
    </div>
  )
}
