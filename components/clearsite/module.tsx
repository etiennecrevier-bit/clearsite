'use client'

import { useState } from 'react'
import { CalendarDays, LayoutGrid, Settings2, ShieldCheck } from 'lucide-react'
import { MONTH_LABEL, TODAY } from '@/lib/clearsite-data'
import { cn } from '@/lib/utils'
import { TodayView } from './today-view'
import { MonthGridView } from './month-grid-view'
import { ProofDetailView } from './proof-detail-view'
import { SettingsView } from './settings-view'

export type View = 'today' | 'grid' | 'settings'

const TABS: { id: View; label: string; icon: typeof CalendarDays }[] = [
  { id: 'today', label: "Aujourd'hui", icon: CalendarDays },
  { id: 'grid', label: 'Grille du mois', icon: LayoutGrid },
  { id: 'settings', label: 'Réglages', icon: Settings2 },
]

export function ClearSiteModule() {
  const [view, setView] = useState<View>('today')
  const [proofId, setProofId] = useState<string | null>(null)
  const [simulation, setSimulation] = useState(true)

  return (
    <div className="min-h-screen bg-background">
      {/* Chrome de Proof : fil d'Ariane Intervention > Surveillance ClearSite */}
      <header className="sticky top-0 z-20 border-b bg-card/80 backdrop-blur">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <ShieldCheck className="size-5" />
            </div>
            <div className="leading-tight">
              <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                <span>Intervention</span>
                <span aria-hidden>/</span>
                <span className="text-foreground">Surveillance ClearSite</span>
              </div>
              <h1 className="text-sm font-semibold text-foreground">Proof — Entretien Allstars</h1>
            </div>
          </div>
          <div className="hidden items-center gap-3 sm:flex">
            {simulation && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-[var(--cell-anomalie)] px-2.5 py-1 text-xs font-medium text-[var(--cell-anomalie-fg)]">
                <span className="size-1.5 animate-pulse rounded-full bg-current" aria-hidden />
                Mode simulation
              </span>
            )}
            <span className="font-mono text-xs text-muted-foreground">{TODAY}</span>
          </div>
        </div>

        <nav className="mx-auto flex max-w-[1400px] gap-1 px-2 sm:px-4" aria-label="Sous-menu ClearSite">
          {TABS.map((tab) => {
            const active = view === tab.id && !proofId
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setProofId(null)
                  setView(tab.id)
                }}
                className={cn(
                  'relative flex items-center gap-2 border-b-2 px-3 py-2.5 text-sm font-medium transition-colors',
                  active
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground',
                )}
              >
                <tab.icon className="size-4" />
                {tab.label}
              </button>
            )
          })}
        </nav>
      </header>

      <main className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6">
        {proofId ? (
          <ProofDetailView proofId={proofId} onBack={() => setProofId(null)} />
        ) : view === 'today' ? (
          <TodayView simulation={simulation} onOpenProof={setProofId} onGoToGrid={() => setView('grid')} />
        ) : view === 'grid' ? (
          <MonthGridView onOpenProof={setProofId} />
        ) : (
          <SettingsView simulation={simulation} onToggleSimulation={setSimulation} />
        )}
      </main>

      <footer className="mx-auto max-w-[1400px] px-4 pb-10 pt-2 text-xs text-muted-foreground sm:px-6">
        Maquette du module Surveillance ClearSite · {MONTH_LABEL} · données de démonstration
      </footer>
    </div>
  )
}
