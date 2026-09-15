'use client'

import { useState } from 'react'
import { Ban, Bell, Clock, FlaskConical, ShieldAlert, UserX } from 'lucide-react'
import { cn } from '@/lib/utils'

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors',
        checked ? 'bg-primary' : 'bg-muted-foreground/30',
      )}
    >
      <span
        className={cn(
          'inline-block size-5 rounded-full bg-card shadow transition-transform',
          checked ? 'translate-x-[22px]' : 'translate-x-0.5',
        )}
      />
    </button>
  )
}

function Row({
  icon: Icon,
  title,
  desc,
  children,
}: {
  icon: typeof Bell
  title: string
  desc: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-4">
      <div className="flex min-w-0 gap-3">
        <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
          <Icon className="size-4" />
        </div>
        <div className="min-w-0">
          <div className="text-sm font-medium">{title}</div>
          <div className="text-xs text-muted-foreground">{desc}</div>
        </div>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  )
}

export function SettingsView({
  simulation,
  onToggleSimulation,
}: {
  simulation: boolean
  onToggleSimulation: (v: boolean) => void
}) {
  const [reminderTime, setReminderTime] = useState('07:00')
  const [oneMax, setOneMax] = useState(true)
  const [skipUnscheduled, setSkipUnscheduled] = useState(true)
  const [escalate, setEscalate] = useState(true)
  const [escalateDays, setEscalateDays] = useState(3)

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h2 className="text-balance text-xl font-semibold tracking-tight">Réglages du module</h2>
        <p className="text-sm text-muted-foreground">
          La porte d&apos;envoi vit ici. Les garde-fous protègent la relation avec le terrain autant que la banque.
        </p>
      </div>

      {/* Mode simulation — en évidence */}
      <section
        className="rounded-lg border p-4"
        style={{ borderColor: 'var(--cell-anomalie-fg)', backgroundColor: 'var(--cell-anomalie)' }}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex gap-3">
            <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-[var(--cell-anomalie-fg)]/15 text-[var(--cell-anomalie-fg)]">
              <FlaskConical className="size-4" />
            </div>
            <div>
              <div className="text-sm font-semibold text-[var(--cell-anomalie-fg)]">Mode simulation</div>
              <div className="max-w-md text-xs text-[var(--cell-anomalie-fg)]/80">
                La tâche calcule qui aurait reçu quoi et journalise chaque ligne, mais n&apos;envoie rien. À garder
                actif jusqu&apos;à ce que la liste soit juste cinq jours ouvrables d&apos;affilée.
              </div>
            </div>
          </div>
          <Toggle checked={simulation} onChange={onToggleSimulation} label="Mode simulation" />
        </div>
        <div className="mt-3 text-xs font-medium text-[var(--cell-anomalie-fg)]">
          {simulation ? 'Aucun message ne part. Les rappels sont écrits en statut « simulé ».' : 'Attention : les rappels seront réellement envoyés aux employés.'}
        </div>
      </section>

      {/* Rappels automatiques */}
      <section className="overflow-hidden rounded-lg border bg-card">
        <div className="border-b px-4 py-3">
          <h3 className="text-sm font-semibold">Rappels automatiques</h3>
        </div>
        <div className="divide-y">
          <Row
            icon={Clock}
            title="Heure d'envoi"
            desc="La tâche planifiée s'exécute chaque jour à cette heure (Montréal)."
          >
            <input
              type="time"
              value={reminderTime}
              onChange={(e) => setReminderTime(e.target.value)}
              className="rounded-md border bg-background px-2.5 py-1.5 font-mono text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </Row>
          <Row
            icon={Bell}
            title="Un rappel par personne par jour"
            desc="Plafond strict : jamais deux messages à la même personne le même jour."
          >
            <Toggle checked={oneMax} onChange={setOneMax} label="Un rappel par jour" />
          </Row>
          <Row
            icon={Ban}
            title="Ne pas écrire hors horaire"
            desc="Aucun envoi à quelqu'un non cédulé (hors_horaire, absence, férié)."
          >
            <Toggle checked={skipUnscheduled} onChange={setSkipUnscheduled} label="Ignorer hors horaire" />
          </Row>
        </div>
      </section>

      {/* Escalade */}
      <section className="overflow-hidden rounded-lg border bg-card">
        <div className="border-b px-4 py-3">
          <h3 className="text-sm font-semibold">Escalade au lieu d&apos;insister</h3>
        </div>
        <div className="divide-y">
          <Row
            icon={UserX}
            title="Signaler à un humain"
            desc="Après plusieurs jours cédulés sans preuve ni réponse, on cesse d'écrire et on signale le cas."
          >
            <Toggle checked={escalate} onChange={setEscalate} label="Escalade" />
          </Row>
          {escalate && (
            <Row
              icon={ShieldAlert}
              title="Seuil d'escalade"
              desc="Nombre de jours cédulés consécutifs sans preuve avant de signaler."
            >
              <div className="flex items-center gap-2">
                {[2, 3, 4].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setEscalateDays(n)}
                    className={cn(
                      'size-8 rounded-md border font-mono text-sm transition-colors',
                      escalateDays === n
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'bg-card hover:bg-accent',
                    )}
                  >
                    {n}
                  </button>
                ))}
                <span className="text-xs text-muted-foreground">jours</span>
              </div>
            </Row>
          )}
        </div>
      </section>

      {/* Sources des attendus */}
      <section className="overflow-hidden rounded-lg border bg-card">
        <div className="border-b px-4 py-3">
          <h3 className="text-sm font-semibold">Source des « attendus »</h3>
        </div>
        <div className="px-4 py-4 text-sm text-muted-foreground">
          <p className="leading-relaxed">
            Chaque nuit, une tâche fige les lignes de la journée à venir : affectation active de l&apos;employé,
            régime de service du bâtiment, hors férié, hors absence. Une ligne datée et figée est une preuve ; un
            calcul à la volée n&apos;en est pas une.
          </p>
          <ul className="mt-3 space-y-1.5">
            {[
              'Affectations actives du répertoire',
              'Régime de service par bâtiment',
              'Jours fériés (avec exception possible par bâtiment)',
              'Absences saisies sur la fiche employé',
            ].map((s) => (
              <li key={s} className="flex items-center gap-2 text-xs">
                <span className="size-1.5 rounded-full bg-primary" aria-hidden />
                <span className="text-foreground">{s}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  )
}
