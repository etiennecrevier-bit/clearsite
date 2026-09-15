'use client'

import { useState } from 'react'
import {
  AlertTriangle,
  ArrowUpRight,
  Bell,
  Check,
  ChevronRight,
  Clock,
  MessageSquare,
  Send,
  X,
} from 'lucide-react'
import {
  ANOMALY_LABELS,
  CLIENT_ORDER,
  CLIENT_SHORT,
  EMPLOYEES,
  STATUS_META,
  TODAY,
  todayReminders,
  todayRows,
  type CellStatus,
  type Site,
} from '@/lib/clearsite-data'
import { StatusBadge } from './status-badge'

const LANG_LABEL: Record<string, string> = { fr: 'FR', en: 'EN', es: 'ES' }

export function TodayView({
  simulation,
  onOpenProof,
  onGoToGrid,
}: {
  simulation: boolean
  onOpenProof: (id: string) => void
  onGoToGrid: () => void
}) {
  const rows = todayRows()
  const reminders = todayReminders()

  const [statusFilter, setStatusFilter] = useState<CellStatus | 'total'>('total')
  const [clientFilter, setClientFilter] = useState<Site['client'] | 'all'>('all')
  const [employeeFilter, setEmployeeFilter] = useState<string>('all')

  const count = (s: CellStatus) => rows.filter((r) => r.cell.status === s).length
  const attendues = rows.length
  const recues = count('recue')
  const anomalies = count('anomalie')
  const manquantes = count('manquante')
  const enAttente = count('attendue')

  const stats: { key: CellStatus | 'total'; label: string; value: number; hint: string }[] = [
    { key: 'total', label: 'Attendues aujourd\u2019hui', value: attendues, hint: 'Bâtiments cédulés' },
    { key: 'recue', label: 'Reçues', value: recues, hint: 'Preuves conformes' },
    { key: 'anomalie', label: 'Anomalies', value: anomalies, hint: 'Contenu à vérifier' },
    { key: 'manquante', label: 'Manquantes', value: manquantes, hint: 'Passé l\u2019heure limite' },
    { key: 'attendue', label: 'En attente', value: enAttente, hint: 'Avant l\u2019heure limite' },
  ]

  // N'afficher que les compagnies / employés réellement cédulés aujourd'hui.
  const activeClients = CLIENT_ORDER.filter((c) => rows.some((r) => r.site.client === c))
  const activeEmployees = EMPLOYEES.filter((e) => rows.some((r) => r.employee.id === e.id))

  const filteredRows = rows.filter((r) => {
    if (statusFilter !== 'total' && r.cell.status !== statusFilter) return false
    if (clientFilter !== 'all' && r.site.client !== clientFilter) return false
    if (employeeFilter !== 'all' && r.employee.id !== employeeFilter) return false
    return true
  })

  const filtersActive = statusFilter !== 'total' || clientFilter !== 'all' || employeeFilter !== 'all'
  const resetFilters = () => {
    setStatusFilter('total')
    setClientFilter('all')
    setEmployeeFilter('all')
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-balance text-xl font-semibold tracking-tight">Suivi du jour</h2>
          <p className="text-sm text-muted-foreground">
            Chaque case cochée automatiquement, chaque case vide devenue une action.
          </p>
        </div>
        <button
          type="button"
          onClick={onGoToGrid}
          className="inline-flex items-center gap-1.5 rounded-md border bg-card px-3 py-2 text-sm font-medium transition-colors hover:bg-accent"
        >
          Voir la grille du mois <ChevronRight className="size-4" />
        </button>
      </div>

      {/* Cartes de synthèse — cliquables pour filtrer par statut */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        {stats.map((s) => {
          const meta = s.key === 'total' ? null : STATUS_META[s.key as CellStatus]
          const active = statusFilter === s.key
          return (
            <button
              key={s.key}
              type="button"
              aria-pressed={active}
              onClick={() => setStatusFilter(s.key)}
              className={`rounded-lg border p-4 text-left transition-colors ${
                active ? 'border-primary bg-accent ring-1 ring-primary' : 'bg-card hover:bg-accent'
              }`}
            >
              <div className="flex items-center gap-2">
                {meta && <span className="size-2.5 rounded-full" style={{ backgroundColor: meta.fg }} aria-hidden />}
                <span className="text-xs font-medium text-muted-foreground">{s.label}</span>
              </div>
              <div className="mt-2 font-mono text-3xl font-semibold tabular-nums">{s.value}</div>
              <div className="mt-0.5 text-xs text-muted-foreground">{s.hint}</div>
            </button>
          )
        })}
      </div>

      {/* Filtres par compagnie / employé */}
      <div className="flex flex-wrap items-center gap-3 rounded-lg border bg-card px-4 py-3">
        <span className="text-xs font-medium text-muted-foreground">Filtrer :</span>
        <label className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Compagnie</span>
          <select
            value={clientFilter}
            onChange={(e) => setClientFilter(e.target.value as Site['client'] | 'all')}
            className="rounded-md border bg-background px-2 py-1.5 text-sm"
          >
            <option value="all">Toutes</option>
            {activeClients.map((c) => (
              <option key={c} value={c}>
                {CLIENT_SHORT[c]}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Employé</span>
          <select
            value={employeeFilter}
            onChange={(e) => setEmployeeFilter(e.target.value)}
            className="rounded-md border bg-background px-2 py-1.5 text-sm"
          >
            <option value="all">Tous</option>
            {activeEmployees.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name}
              </option>
            ))}
          </select>
        </label>
        {filtersActive && (
          <button
            type="button"
            onClick={resetFilters}
            className="inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <X className="size-3.5" /> Réinitialiser
          </button>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        {/* Liste des bâtiments du jour */}
        <section className="rounded-lg border bg-card">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <h3 className="text-sm font-semibold">Bâtiments cédulés — {TODAY}</h3>
            <span className="text-xs text-muted-foreground">
              {filtersActive ? `${filteredRows.length} / ${rows.length}` : rows.length} lignes
            </span>
          </div>
          <ul className="divide-y">
            {filteredRows.length === 0 && (
              <li className="px-4 py-8 text-center text-sm text-muted-foreground">
                Aucun bâtiment ne correspond à ces filtres.
              </li>
            )}
            {filteredRows
              .slice()
              .sort((a, b) => order(a.cell.status) - order(b.cell.status))
              .map((r) => {
                const clickable = Boolean(r.cell.proofId)
                return (
                  <li key={r.site.id}>
                    <button
                      type="button"
                      disabled={!clickable}
                      onClick={() => r.cell.proofId && onOpenProof(r.cell.proofId)}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors enabled:hover:bg-accent disabled:cursor-default"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="truncate text-sm font-medium">
                            {r.site.client} · {r.site.name}
                          </span>
                          <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                            {r.site.clearsiteCode}
                          </span>
                        </div>
                        <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{r.employee.name}</span>
                          <span aria-hidden>·</span>
                          <span className="inline-flex items-center gap-1">
                            <Clock className="size-3" /> limite {r.site.heureLimite}
                          </span>
                          {r.cell.anomalies?.[0] && (
                            <span className="inline-flex items-center gap-1 text-[var(--cell-anomalie-fg)]">
                              <AlertTriangle className="size-3" />
                              {ANOMALY_LABELS[r.cell.anomalies[0]].label}
                            </span>
                          )}
                        </div>
                      </div>
                      <StatusBadge status={r.cell.status} />
                      {clickable && <ArrowUpRight className="size-4 shrink-0 text-muted-foreground" />}
                    </button>
                  </li>
                )
              })}
          </ul>
        </section>

        {/* File des rappels */}
        <section className="flex flex-col rounded-lg border bg-card">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <h3 className="inline-flex items-center gap-2 text-sm font-semibold">
              <Bell className="size-4" /> Rappels du jour
            </h3>
            {simulation ? (
              <span className="rounded-full bg-[var(--cell-anomalie)] px-2 py-0.5 text-[11px] font-medium text-[var(--cell-anomalie-fg)]">
                Simulé
              </span>
            ) : (
              <span className="rounded-full bg-[var(--cell-recue)] px-2 py-0.5 text-[11px] font-medium text-[var(--cell-recue-fg)]">
                Envoi actif
              </span>
            )}
          </div>

          <div className="border-b bg-muted/40 px-4 py-2.5 text-xs text-muted-foreground">
            {simulation ? (
              <span>
                La tâche a calculé <strong className="text-foreground">{reminders.length}</strong> rappel(s) à
                l&apos;heure prévue. Rien n&apos;est envoyé tant que la simulation est active.
              </span>
            ) : (
              <span>
                <strong className="text-foreground">{reminders.length}</strong> rappel(s) seront envoyés à l&apos;heure
                limite, un par personne, dans sa langue.
              </span>
            )}
          </div>

          <ul className="divide-y overflow-y-auto">
            {reminders.length === 0 && (
              <li className="flex items-center gap-2 px-4 py-6 text-sm text-muted-foreground">
                <Check className="size-4 text-[var(--cell-recue-fg)]" /> Aucune preuve manquante — rien à envoyer.
              </li>
            )}
            {reminders.map((m) => (
              <li key={m.id} className="px-4 py-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium">{m.employee.name}</span>
                  <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                    {LANG_LABEL[m.lang]}
                  </span>
                </div>
                <p className="mt-1 flex gap-1.5 text-xs leading-relaxed text-muted-foreground">
                  <MessageSquare className="mt-0.5 size-3 shrink-0" />
                  <span>{m.body}</span>
                </p>
              </li>
            ))}
          </ul>

          {reminders.length > 0 && (
            <div className="mt-auto border-t p-3">
              <button
                type="button"
                disabled={simulation}
                className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-opacity disabled:opacity-40"
              >
                <Send className="size-4" />
                {simulation ? 'Envoi désactivé (simulation)' : `Envoyer ${reminders.length} rappel(s)`}
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

function order(s: CellStatus): number {
  const rank: Record<CellStatus, number> = {
    manquante: 0,
    anomalie: 1,
    attendue: 2,
    recue: 3,
    excusee: 4,
    non_requis: 5,
    ferie: 6,
    futur: 7,
  }
  return rank[s]
}
