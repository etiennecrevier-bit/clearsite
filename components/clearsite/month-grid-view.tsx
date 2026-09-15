'use client'

import { useMemo, useState } from 'react'
import { Check, Info, X } from 'lucide-react'
import {
  CLIENT_ORDER,
  CLIENT_SHORT,
  DAYS_IN_MONTH,
  EMPLOYEES,
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
  type Regime,
  type Site,
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

type GroupMode = 'none' | 'client' | 'cleaner'

const GROUP_OPTIONS: { mode: GroupMode; label: string }[] = [
  { mode: 'none', label: 'Aucun' },
  { mode: 'client', label: 'Par compagnie' },
  { mode: 'cleaner', label: 'Par employé' },
]

type SiteGroup = { key: string; label: string; sublabel: string; sites: Site[] }

function byName(a: Site, b: Site): number {
  return a.name.localeCompare(b.name, 'fr')
}

function buildGroups(mode: GroupMode): SiteGroup[] {
  if (mode === 'client') {
    return CLIENT_ORDER.map((client) => {
      const sites = SITES.filter((s) => s.client === client).sort(byName)
      return { key: client, label: client, sublabel: `${sites.length} bâtiments`, sites }
    }).filter((g) => g.sites.length > 0)
  }
  if (mode === 'cleaner') {
    return [...EMPLOYEES]
      .sort((a, b) => a.name.localeCompare(b.name, 'fr'))
      .map((emp) => {
        const sites = SITES.filter((s) => s.employeeId === emp.id).sort(byName)
        return { key: emp.id, label: emp.name, sublabel: `${sites.length} bâtiments`, sites }
      })
      .filter((g) => g.sites.length > 0)
  }
  const all = [...SITES].sort((a, b) => CLIENT_ORDER.indexOf(a.client) - CLIENT_ORDER.indexOf(b.client) || byName(a, b))
  return [{ key: 'all', label: 'Tous les bâtiments', sublabel: `${all.length} bâtiments`, sites: all }]
}

function countStatuses(sites: Site[]) {
  const ids = new Set(sites.map((s) => s.id))
  let recue = 0
  let anomalie = 0
  let manquante = 0
  for (const c of GRID) {
    if (!ids.has(c.siteId)) continue
    if (c.status === 'recue') recue++
    else if (c.status === 'anomalie') anomalie++
    else if (c.status === 'manquante') manquante++
  }
  return { recue, anomalie, manquante }
}

const REGIME_ORDER: Regime[] = ['7j', '6j', 'ferme_fin_de_semaine', '5j_atm']

export function MonthGridView({ onOpenProof }: { onOpenProof: (id: string) => void }) {
  const [hover, setHover] = useState<string | null>(null)
  const [groupBy, setGroupBy] = useState<GroupMode>('client')
  const days = Array.from({ length: DAYS_IN_MONTH }, (_, i) => i + 1)

  const groups = useMemo(() => buildGroups(groupBy), [groupBy])

  const total = GRID.length
  const recues = GRID.filter((c) => c.status === 'recue').length
  const anomalies = GRID.filter((c) => c.status === 'anomalie').length
  const manquantes = GRID.filter((c) => c.status === 'manquante').length

  const regimeCounts = REGIME_ORDER.map((r) => ({ r, n: SITES.filter((s) => s.regime === r).length }))

  const colCount = 1 + days.length

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-balance text-xl font-semibold tracking-tight">Grille du mois — {MONTH_LABEL}</h2>
          <p className="text-sm text-muted-foreground">
            {SITES.length} bâtiments, {EMPLOYEES.length} employés, {CLIENT_ORDER.length} réseaux. Une ligne par
            bâtiment, une colonne par journée.
          </p>
        </div>
        <div className="flex gap-4 font-mono text-xs text-muted-foreground">
          <span><strong className="text-foreground">{recues}</strong> reçues</span>
          <span><strong className="text-[var(--cell-anomalie-fg)]">{anomalies}</strong> anomalies</span>
          <span><strong className="text-[var(--cell-manquante-fg)]">{manquantes}</strong> manquantes</span>
          <span className="text-muted-foreground/70">/ {total} cases</span>
        </div>
      </div>

      {/* Contrôle de regroupement + légende */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">Classer&nbsp;:</span>
          <div className="inline-flex rounded-md border bg-card p-0.5">
            {GROUP_OPTIONS.map((opt) => (
              <button
                key={opt.mode}
                type="button"
                onClick={() => setGroupBy(opt.mode)}
                className={cn(
                  'rounded-[5px] px-3 py-1 text-xs font-medium transition-colors',
                  groupBy === opt.mode
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
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
      </div>

      {/* Grille */}
      <div className="max-h-[72vh] overflow-auto rounded-lg border bg-card">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr>
              <th className="sticky left-0 top-0 z-30 min-w-[230px] border-b border-r bg-card px-3 py-2 text-left font-medium text-muted-foreground">
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
                      'sticky top-0 z-20 border-b border-l bg-card px-0 py-1 text-center align-middle font-normal',
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
            {groups.map((group) => {
              const counts = countStatuses(group.sites)
              return (
                <GroupBlock key={group.key} group={group} counts={counts} colCount={colCount} show={groupBy !== 'none'}>
                  {group.sites.map((site) => {
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
                            <span>{CLIENT_SHORT[site.client]}</span>
                            <span aria-hidden>·</span>
                            <span>{emp?.name}</span>
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
                                  'flex h-7 w-full items-center justify-center font-mono text-[11px] font-semibold outline-none',
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
                </GroupBlock>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Résumé des régimes de service */}
      <div className="rounded-lg border bg-card p-4">
        <h3 className="mb-3 inline-flex items-center gap-2 text-sm font-semibold">
          <Info className="size-4" /> Régimes de service du parc
        </h3>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {regimeCounts.map(({ r, n }) => (
            <div key={r} className="flex items-center justify-between gap-2 rounded-md bg-muted/50 px-3 py-2 text-xs">
              <span className="truncate text-muted-foreground">{REGIME_LABELS[r]}</span>
              <span className="shrink-0 font-mono font-semibold text-foreground">{n}</span>
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

function GroupBlock({
  group,
  counts,
  colCount,
  show,
  children,
}: {
  group: SiteGroup
  counts: { recue: number; anomalie: number; manquante: number }
  colCount: number
  show: boolean
  children: React.ReactNode
}) {
  return (
    <>
      {show && (
        <tr>
          <td colSpan={colCount} className="border-b border-t bg-muted/60 p-0">
            <div className="sticky left-0 z-[5] flex w-max items-center gap-3 px-3 py-1.5">
              <span className="text-[13px] font-semibold text-foreground">{group.label}</span>
              <span className="text-[11px] text-muted-foreground">{group.sublabel}</span>
              <span className="flex items-center gap-2 font-mono text-[10px]">
                <span className="text-[var(--cell-recue-fg)]">{counts.recue} reçues</span>
                <span className="text-[var(--cell-anomalie-fg)]">{counts.anomalie} anomalies</span>
                <span className="text-[var(--cell-manquante-fg)]">{counts.manquante} manquantes</span>
              </span>
            </div>
          </td>
        </tr>
      )}
      {children}
    </>
  )
}
