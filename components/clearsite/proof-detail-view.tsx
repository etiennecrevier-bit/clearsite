'use client'

import {
  AlertTriangle,
  ArrowLeft,
  Check,
  Clock,
  Fingerprint,
  MapPin,
  Ruler,
  Signal,
  Smartphone,
  X,
} from 'lucide-react'
import {
  ANOMALY_LABELS,
  getEmployee,
  getProof,
  getSite,
  type Proof,
  type Site,
} from '@/lib/clearsite-data'
import { cn } from '@/lib/utils'

const SCREEN_STATE_LABEL: Record<Proof['screenState'], string> = {
  verifie: 'Vérifié',
  sorti: 'A Salido / Sorti',
  historique: "Historique d'emploi",
  illisible: 'Illisible',
}

const REVIEW_LABEL: Record<Proof['reviewStatus'], { label: string; bg: string; fg: string }> = {
  auto: { label: 'Classée automatiquement', bg: 'var(--cell-recue)', fg: 'var(--cell-recue-fg)' },
  a_valider: { label: 'À valider', bg: 'var(--cell-anomalie)', fg: 'var(--cell-anomalie-fg)' },
  valide: { label: 'Validée', bg: 'var(--cell-recue)', fg: 'var(--cell-recue-fg)' },
  rejete: { label: 'Rejetée', bg: 'var(--cell-manquante)', fg: 'var(--cell-manquante-fg)' },
  doublon: { label: 'Doublon', bg: 'var(--cell-excusee)', fg: 'var(--cell-excusee-fg)' },
}

export function ProofDetailView({ proofId, onBack }: { proofId: string; onBack: () => void }) {
  const proof = getProof(proofId)
  if (!proof) {
    return (
      <div className="space-y-4">
        <BackButton onBack={onBack} />
        <p className="text-sm text-muted-foreground">Preuve introuvable.</p>
      </div>
    )
  }
  const site = getSite(proof.siteId)!
  const emp = getEmployee(proof.employeeId)!
  const review = REVIEW_LABEL[proof.reviewStatus]
  const confidencePct = Math.round(proof.ocrConfidence * 100)

  return (
    <div className="space-y-5">
      <BackButton onBack={onBack} />

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-balance text-xl font-semibold tracking-tight">
            {site.client} · {site.name}
          </h2>
          <p className="text-sm text-muted-foreground">
            {emp.name} · reçue le <span className="font-mono">{proof.receivedAt}</span> par{' '}
            {proof.channel === 'whatsapp' ? 'WhatsApp' : 'courriel'}
          </p>
        </div>
        <span
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
          style={{ backgroundColor: review.bg, color: review.fg }}
        >
          <span className="size-1.5 rounded-full bg-current" aria-hidden />
          {review.label}
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(280px,360px)_1fr]">
        {/* Reconstruction de la capture */}
        <div>
          <PhoneCapture proof={proof} site={site} />
          <p className="mt-2 text-center text-xs text-muted-foreground">
            <Smartphone className="mr-1 inline size-3" />
            Capture d&apos;origine conservée — preuve opposable à la banque.
          </p>
        </div>

        {/* Champs lus + anomalies + appariement */}
        <div className="space-y-5">
          {/* Lecture automatique */}
          <section className="rounded-lg border bg-card">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <h3 className="text-sm font-semibold">Champs lus automatiquement</h3>
              <span
                className={cn(
                  'font-mono text-xs',
                  confidencePct >= 90 ? 'text-[var(--cell-recue-fg)]' : 'text-[var(--cell-anomalie-fg)]',
                )}
              >
                confiance {confidencePct}%
              </span>
            </div>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-3 p-4 text-sm">
              <Field icon={Fingerprint} label="Code ClearSite" value={proof.clearsiteCode} mono />
              <Field label="Transit" value={proof.transit} mono />
              <Field icon={MapPin} label="Adresse" value={proof.address} span />
              <Field icon={Clock} label="Entrée" value={proof.checkIn} mono />
              <Field
                icon={Clock}
                label="Sortie"
                value={proof.checkOut ?? 'Absente'}
                mono
                alert={!proof.checkOut}
              />
              <Field icon={Ruler} label="Distance" value={`${proof.distanceRaw} · ${proof.distanceM} m`} alert={proof.distanceM > 500} />
              <Field label="Service" value={proof.service} />
              <Field icon={Signal} label="État de l'écran" value={SCREEN_STATE_LABEL[proof.screenState]} />
              <Field label="Langue de l'écran" value={proof.screenLang.toUpperCase()} />
              <Field icon={Fingerprint} label="N° de confirmation" value={proof.confirmationNo} mono span />
            </dl>
          </section>

          {/* Anomalies */}
          {proof.anomalies.length > 0 && (
            <section className="rounded-lg border border-[var(--cell-anomalie-fg)]/30 bg-[var(--cell-anomalie)]/40">
              <div className="border-b border-[var(--cell-anomalie-fg)]/20 px-4 py-3">
                <h3 className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--cell-anomalie-fg)]">
                  <AlertTriangle className="size-4" /> {proof.anomalies.length} anomalie(s) détectée(s)
                </h3>
              </div>
              <ul className="divide-y divide-[var(--cell-anomalie-fg)]/15 px-4">
                {proof.anomalies.map((a) => (
                  <li key={a} className="py-3">
                    <div className="text-sm font-medium text-foreground">{ANOMALY_LABELS[a].label}</div>
                    <div className="text-xs text-muted-foreground">{ANOMALY_LABELS[a].hint}</div>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Cascade d'appariement */}
          <section className="rounded-lg border bg-card p-4">
            <h3 className="mb-3 text-sm font-semibold">Appariement au bâtiment</h3>
            <ol className="flex flex-wrap items-center gap-2 text-xs">
              {[
                { k: 'Code ClearSite', v: proof.clearsiteCode, hit: true },
                { k: 'Transit', v: proof.transit, hit: false },
                { k: 'Adresse', v: site.city, hit: false },
                { k: 'Nom', v: site.name, hit: false },
              ].map((step, i, arr) => (
                <li key={step.k} className="flex items-center gap-2">
                  <span
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-md border px-2 py-1',
                      step.hit
                        ? 'border-[var(--cell-recue-fg)]/40 bg-[var(--cell-recue)] text-[var(--cell-recue-fg)]'
                        : 'bg-muted text-muted-foreground',
                    )}
                  >
                    {step.hit && <Check className="size-3" />}
                    <span className="font-medium">{step.k}</span>
                    <span className="font-mono">{step.v}</span>
                  </span>
                  {i < arr.length - 1 && <span className="text-muted-foreground/50" aria-hidden>→</span>}
                </li>
              ))}
            </ol>
            <p className="mt-3 text-xs text-muted-foreground">
              Le premier identifiant qui répond gagne. Ici, le code ClearSite a suffi — appariement sans ambiguïté.
            </p>
          </section>

          {/* Actions de révision */}
          <section className="flex flex-wrap gap-2">
            <button className="inline-flex items-center gap-2 rounded-md bg-primary px-3.5 py-2 text-sm font-medium text-primary-foreground">
              <Check className="size-4" /> Valider la preuve
            </button>
            <button className="inline-flex items-center gap-2 rounded-md border bg-card px-3.5 py-2 text-sm font-medium hover:bg-accent">
              <AlertTriangle className="size-4" /> Marquer excusée
            </button>
            <button className="inline-flex items-center gap-2 rounded-md border bg-card px-3.5 py-2 text-sm font-medium text-[var(--cell-manquante-fg)] hover:bg-accent">
              <X className="size-4" /> Rejeter
            </button>
          </section>
        </div>
      </div>
    </div>
  )
}

function BackButton({ onBack }: { onBack: () => void }) {
  return (
    <button
      type="button"
      onClick={onBack}
      className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
    >
      <ArrowLeft className="size-4" /> Retour
    </button>
  )
}

function Field({
  icon: Icon,
  label,
  value,
  mono,
  span,
  alert,
}: {
  icon?: typeof Clock
  label: string
  value: string
  mono?: boolean
  span?: boolean
  alert?: boolean
}) {
  return (
    <div className={cn(span && 'col-span-2')}>
      <dt className="flex items-center gap-1 text-xs text-muted-foreground">
        {Icon && <Icon className="size-3" />}
        {label}
      </dt>
      <dd
        className={cn(
          'mt-0.5 text-sm',
          mono && 'font-mono',
          alert ? 'font-medium text-[var(--cell-anomalie-fg)]' : 'text-foreground',
        )}
      >
        {value}
      </dd>
    </div>
  )
}

function PhoneCapture({ proof, site }: { proof: Proof; site: Site }) {
  const verified = proof.screenState !== 'illisible'
  return (
    <div className="mx-auto w-full max-w-[320px] rounded-[2rem] border-4 border-foreground/85 bg-foreground/85 p-1.5 shadow-xl">
      <div className="overflow-hidden rounded-[1.6rem] bg-card">
        {/* barre d'état */}
        <div className="flex items-center justify-between bg-primary px-4 py-2 text-[10px] font-medium text-primary-foreground">
          <span className="font-mono">{proof.checkIn.split(' ').slice(1).join(' ')}</span>
          <span className="font-semibold tracking-wide">ClearSite</span>
          <span className="font-mono">▲ ▮▮</span>
        </div>

        {/* corps de l'écran */}
        <div className="space-y-3 px-4 py-4">
          <div className="flex flex-col items-center gap-2 pb-1 text-center">
            <div
              className="flex size-12 items-center justify-center rounded-full"
              style={{
                backgroundColor: verified ? 'var(--cell-recue)' : 'var(--cell-manquante)',
                color: verified ? 'var(--cell-recue-fg)' : 'var(--cell-manquante-fg)',
              }}
            >
              {verified ? <Check className="size-6" /> : <X className="size-6" />}
            </div>
            <div className="text-sm font-semibold">
              {proof.screenLang === 'es' ? 'Servicio confirmado' : proof.screenLang === 'en' ? 'Service confirmed' : 'Service confirmé'}
            </div>
          </div>

          <CaptureRow label={proof.clearsiteCode} value={`${site.transit} · ${site.name}`} bold />
          <CaptureRow label={proof.screenLang === 'es' ? 'Cliente' : 'Client'} value={proof.client} />
          <CaptureRow label="Distance" value={proof.distanceRaw} />
          <CaptureRow
            label={proof.screenLang === 'es' ? 'Entrada' : proof.screenLang === 'en' ? 'Check-in' : 'Entrée'}
            value={proof.checkIn}
          />
          <CaptureRow
            label={proof.screenLang === 'es' ? 'Salida' : proof.screenLang === 'en' ? 'Check-out' : 'Sortie'}
            value={proof.checkOut ?? '—'}
            alert={!proof.checkOut}
          />

          <div className="mt-1 rounded-md bg-muted px-3 py-2">
            <div className="text-[9px] uppercase tracking-wide text-muted-foreground">Confirmation</div>
            <div className="break-all font-mono text-[11px] text-foreground">{proof.confirmationNo}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

function CaptureRow({ label, value, bold, alert }: { label: string; value: string; bold?: boolean; alert?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-dashed border-border pb-2 text-xs last:border-0">
      <span className="shrink-0 text-muted-foreground">{label}</span>
      <span
        className={cn(
          'text-right font-mono',
          bold && 'font-semibold',
          alert ? 'text-[var(--cell-manquante-fg)]' : 'text-foreground',
        )}
      >
        {value}
      </span>
    </div>
  )
}
