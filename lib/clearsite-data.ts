// Données de démonstration du module Surveillance ClearSite.
// Fidèles aux neuf captures réelles et aux conventions de la feuille papier d'août :
// une ligne = un bâtiment (transit + succursale), une colonne = une journée opérationnelle.

export type Regime =
  | '7j'
  | '6j'
  | 'ferme_fin_de_semaine'
  | '5j_atm'
  | 'aucun'

export type CellStatus =
  | 'recue' // preuve reçue et conforme
  | 'anomalie' // preuve reçue mais son contenu pose question
  | 'manquante' // service attendu, aucune preuve
  | 'excusee' // absence légitime consignée
  | 'non_requis' // aucun service prévu ce jour (régime)
  | 'ferie' // jour férié
  | 'attendue' // aujourd'hui, pas encore l'heure limite
  | 'futur' // journée à venir

export type AnomalyCode =
  | 'sortie_absente'
  | 'mauvais_ecran'
  | 'distance_elevee'
  | 'batiment_inconnu'
  | 'mauvais_batiment'
  | 'date_decalee'
  | 'duree_improbable'
  | 'doublon'
  | 'illisible'

export const ANOMALY_LABELS: Record<AnomalyCode, { label: string; hint: string }> = {
  sortie_absente: { label: 'Sortie absente', hint: "Entrée lue, aucune heure de sortie — « forgot to checkout »" },
  mauvais_ecran: { label: 'Mauvais écran', hint: "Écran d'historique sans numéro de confirmation — « only job history »" },
  distance_elevee: { label: 'Distance élevée', hint: 'Distance supérieure à 500 m du bâtiment attendu' },
  batiment_inconnu: { label: 'Bâtiment inconnu', hint: 'Code et transit sans correspondance au répertoire' },
  mauvais_batiment: { label: 'Mauvais bâtiment', hint: "Bâtiment lu ≠ bâtiment attendu de cet employé ce jour-là" },
  date_decalee: { label: 'Date décalée', hint: 'La date de la capture diffère de la date de réception' },
  duree_improbable: { label: 'Durée improbable', hint: 'Passage de moins de 10 min ou de plus de 8 h' },
  doublon: { label: 'Doublon', hint: 'Numéro de confirmation déjà reçu' },
  illisible: { label: 'Illisible', hint: "La lecture automatique de l'image a échoué" },
}

export type Employee = {
  id: string
  name: string
  phone: string
  lang: 'fr' | 'en' | 'es'
}

export type Site = {
  id: string
  client: 'BMO' | 'TD CANADA' | 'BANQUE LAURENTIENNE'
  name: string
  address: string
  city: string
  clearsiteCode: string
  transit: string
  regime: Regime
  heureLimite: string
  employeeId: string
}

export type Proof = {
  id: string
  siteId: string
  employeeId: string
  operationalDate: string // AAAA-MM-JJ
  client: string
  address: string
  clearsiteCode: string
  transit: string
  distanceM: number
  distanceRaw: string
  service: string
  checkIn: string
  checkOut: string | null
  confirmationNo: string
  screenLang: 'fr' | 'en' | 'es'
  screenState: 'verifie' | 'sorti' | 'historique' | 'illisible'
  ocrConfidence: number
  anomalies: AnomalyCode[]
  reviewStatus: 'auto' | 'a_valider' | 'valide' | 'rejete' | 'doublon'
  receivedAt: string
  channel: 'whatsapp' | 'courriel'
}

export const TODAY = '2026-09-15'
export const MONTH_LABEL = 'Septembre 2026'
export const DAYS_IN_MONTH = 30
export const TODAY_DAY = 15

// Fériés du mois (liste plate). 7 sept. 2026 = Fête du travail.
export const HOLIDAYS: Record<number, string> = {
  7: 'Fête du travail',
}

export const REGIME_LABELS: Record<Regime, string> = {
  '7j': '7 jours sur 7',
  '6j': '6 jours (lun. au sam.)',
  ferme_fin_de_semaine: 'Fermé la fin de semaine',
  '5j_atm': '5 jours + guichet le 6e',
  aucun: 'Non suivi',
}

export const EMPLOYEES: Employee[] = [
  { id: 'e-charles', name: 'Charles Mbeki', phone: '+1 514 555 0142', lang: 'fr' },
  { id: 'e-marco', name: 'Marco Silva', phone: '+1 514 555 0198', lang: 'es' },
  { id: 'e-simon', name: 'Simon Tremblay', phone: '+1 438 555 0110', lang: 'fr' },
  { id: 'e-diab', name: 'Diab Haddad', phone: '+1 514 555 0176', lang: 'fr' },
  { id: 'e-luis', name: 'Luis Ortega', phone: '+1 438 555 0155', lang: 'es' },
  { id: 'e-nadia', name: 'Nadia Belanger', phone: '+1 514 555 0133', lang: 'fr' },
]

export const SITES: Site[] = [
  { id: 's-1', client: 'TD CANADA', name: 'Montée Gagnon', address: '3461 Montée Gagnon, Terrebonne', city: 'Terrebonne', clearsiteCode: 'TDA1506', transit: '4207', regime: 'ferme_fin_de_semaine', heureLimite: '06:30', employeeId: 'e-charles' },
  { id: 's-2', client: 'TD CANADA', name: 'Cavendish Mall', address: '5800 boul. Cavendish, Montréal', city: 'Montréal', clearsiteCode: 'TDA0718', transit: '3461', regime: '5j_atm', heureLimite: '06:30', employeeId: 'e-charles' },
  { id: 's-3', client: 'BMO', name: 'Place Ville-Marie', address: '1 Place Ville-Marie, Montréal', city: 'Montréal', clearsiteCode: 'BMO2214', transit: '0812', regime: '6j', heureLimite: '07:00', employeeId: 'e-marco' },
  { id: 's-4', client: 'BMO', name: 'Rosemère', address: '401 boul. Labelle, Rosemère', city: 'Rosemère', clearsiteCode: 'BMO1930', transit: '1155', regime: 'ferme_fin_de_semaine', heureLimite: '06:30', employeeId: 'e-simon' },
  { id: 's-5', client: 'TD CANADA', name: 'Saint-Jean-sur-Richelieu', address: '155 rue Richelieu, Saint-Jean', city: 'Saint-Jean', clearsiteCode: 'TDA0442', transit: '5031', regime: '5j_atm', heureLimite: '06:30', employeeId: 'e-luis' },
  { id: 's-6', client: 'BANQUE LAURENTIENNE', name: 'Anjou', address: '7999 boul. les Galeries d\'Anjou, Anjou', city: 'Anjou', clearsiteCode: 'BLC0088', transit: '2200', regime: 'ferme_fin_de_semaine', heureLimite: '23:30', employeeId: 'e-diab' },
  { id: 's-7', client: 'TD CANADA', name: 'Longueuil Centre', address: '825 rue Saint-Laurent O., Longueuil', city: 'Longueuil', clearsiteCode: 'TDA0903', transit: '4488', regime: '7j', heureLimite: '06:00', employeeId: 'e-nadia' },
  { id: 's-8', client: 'BMO', name: 'Laval Carré', address: '3035 boul. Le Carrefour, Laval', city: 'Laval', clearsiteCode: 'BMO0571', transit: '0640', regime: '6j', heureLimite: '07:00', employeeId: 'e-marco' },
  { id: 's-9', client: 'TD CANADA', name: 'Brossard Quartier', address: '9160 boul. Leduc, Brossard', city: 'Brossard', clearsiteCode: 'TDA1120', transit: '4790', regime: 'ferme_fin_de_semaine', heureLimite: '06:30', employeeId: 'e-luis' },
  { id: 's-10', client: 'BANQUE LAURENTIENNE', name: 'Saint-Léonard', address: '5115 rue Jean-Talon E., Saint-Léonard', city: 'Montréal', clearsiteCode: 'BLC0142', transit: '2318', regime: 'ferme_fin_de_semaine', heureLimite: '23:30', employeeId: 'e-diab' },
  { id: 's-11', client: 'BMO', name: 'Dollard-des-Ormeaux', address: '3901 boul. Saint-Jean, DDO', city: 'DDO', clearsiteCode: 'BMO2088', transit: '0977', regime: '5j_atm', heureLimite: '07:00', employeeId: 'e-simon' },
  { id: 's-12', client: 'TD CANADA', name: 'Repentigny', address: '635 rue Notre-Dame, Repentigny', city: 'Repentigny', clearsiteCode: 'TDA0655', transit: '4055', regime: 'ferme_fin_de_semaine', heureLimite: '06:30', employeeId: 'e-nadia' },
]

// ── Générateur déterministe ────────────────────────────────────────────────

function hash(a: number, b: number): number {
  const x = Math.sin(a * 928.37 + b * 41.13) * 10000
  return x - Math.floor(x)
}

function weekday(day: number): number {
  // 0 = dimanche … 6 = samedi
  return new Date(2026, 8, day).getDay()
}

function serviceExpected(regime: Regime, day: number): boolean {
  const wd = weekday(day)
  switch (regime) {
    case '7j':
      return true
    case '6j':
      return wd !== 0 // fermé le dimanche
    case 'ferme_fin_de_semaine':
      return wd !== 0 && wd !== 6
    case '5j_atm':
      return wd !== 0 // lun-ven complet + samedi guichet
    case 'aucun':
      return false
  }
}

const HEX = '0123456789abcdef'
function confirmationNo(seed: number): string {
  let s = ''
  for (let i = 0; i < 24; i++) {
    s += HEX[Math.floor(hash(seed, i) * 16)]
  }
  return '#' + s
}

function pad(n: number): string {
  return n < 10 ? '0' + n : '' + n
}

function timeFor(seed: number, base: number): string {
  const mins = base + Math.floor(hash(seed, 7) * 40)
  const h = Math.floor(mins / 60)
  const m = mins % 60
  const ampm = h < 12 ? 'AM' : 'PM'
  const h12 = h % 12 === 0 ? 12 : h % 12
  return `${pad(h12)}:${pad(m)} ${ampm}`
}

export type Cell = {
  siteId: string
  day: number
  status: CellStatus
  proofId?: string
  anomalies?: AnomalyCode[]
  serviceType?: 'complet' | 'guichet'
}

const proofsById = new Map<string, Proof>()

function buildProof(site: Site, day: number, status: 'recue' | 'anomalie', anomalies: AnomalyCode[]): Proof {
  const seed = site.id.charCodeAt(2) * 100 + day
  const id = `p-${site.id}-${day}`
  const emp = EMPLOYEES.find((e) => e.id === site.employeeId)!
  const distanceM = anomalies.includes('distance_elevee') ? 3700 : Math.floor(hash(seed, 3) * 120)
  const noCheckout = anomalies.includes('sortie_absente')
  const isHistory = anomalies.includes('mauvais_ecran')
  const proof: Proof = {
    id,
    siteId: site.id,
    employeeId: site.employeeId,
    operationalDate: `2026-09-${pad(day)}`,
    client: site.client,
    address: site.address,
    clearsiteCode: site.clearsiteCode,
    transit: site.transit,
    distanceM,
    distanceRaw: emp.lang === 'en' ? `${(distanceM / 1609).toFixed(1)} mi` : `${(distanceM / 1000).toFixed(1)} km`,
    service: emp.lang === 'es' ? 'Limpieza interior' : 'Nettoyage intérieur',
    checkIn: `${day}-Sep-2026 ${timeFor(seed, 5 * 60 + 5)}`,
    checkOut: noCheckout ? null : `${day}-Sep-2026 ${timeFor(seed, 5 * 60 + 48)}`,
    confirmationNo: confirmationNo(seed),
    screenLang: emp.lang,
    screenState: isHistory ? 'historique' : noCheckout ? 'verifie' : 'sorti',
    ocrConfidence: status === 'anomalie' ? 0.71 + hash(seed, 9) * 0.1 : 0.94 + hash(seed, 9) * 0.05,
    anomalies,
    reviewStatus: status === 'anomalie' ? 'a_valider' : 'auto',
    receivedAt: `2026-09-${pad(day)} ${timeFor(seed, 5 * 60 + 51)}`,
    channel: hash(seed, 11) > 0.1 ? 'whatsapp' : 'courriel',
  }
  proofsById.set(id, proof)
  return proof
}

function anomaliesFor(seed: number): AnomalyCode[] {
  const pool: AnomalyCode[] = ['sortie_absente', 'mauvais_ecran', 'distance_elevee', 'duree_improbable', 'date_decalee']
  return [pool[Math.floor(hash(seed, 13) * pool.length)]]
}

function buildGrid(): Cell[] {
  const cells: Cell[] = []
  for (const site of SITES) {
    for (let day = 1; day <= DAYS_IN_MONTH; day++) {
      const wd = weekday(day)
      const seed = site.id.charCodeAt(2) * 100 + day

      if (HOLIDAYS[day]) {
        cells.push({ siteId: site.id, day, status: 'ferie' })
        continue
      }
      if (!serviceExpected(site.regime, day)) {
        cells.push({ siteId: site.id, day, status: 'non_requis' })
        continue
      }

      const serviceType: 'complet' | 'guichet' =
        site.regime === '5j_atm' && wd === 6 ? 'guichet' : 'complet'

      if (day > TODAY_DAY) {
        cells.push({ siteId: site.id, day, status: 'futur', serviceType })
        continue
      }

      if (day === TODAY_DAY) {
        // aujourd'hui : la plupart déjà reçues, quelques-unes encore attendues
        const r = hash(seed, 21)
        if (r > 0.55) {
          const p = buildProof(site, day, 'recue', [])
          cells.push({ siteId: site.id, day, status: 'recue', proofId: p.id, serviceType })
        } else if (r > 0.4) {
          const anos = anomaliesFor(seed)
          const p = buildProof(site, day, 'anomalie', anos)
          cells.push({ siteId: site.id, day, status: 'anomalie', proofId: p.id, anomalies: anos, serviceType })
        } else {
          cells.push({ siteId: site.id, day, status: 'attendue', serviceType })
        }
        continue
      }

      // journées passées
      const r = hash(seed, 31)
      if (r > 0.9) {
        cells.push({ siteId: site.id, day, status: 'excusee', serviceType })
      } else if (r > 0.82) {
        cells.push({ siteId: site.id, day, status: 'manquante', serviceType })
      } else if (r > 0.68) {
        const anos = anomaliesFor(seed)
        const p = buildProof(site, day, 'anomalie', anos)
        cells.push({ siteId: site.id, day, status: 'anomalie', proofId: p.id, anomalies: anos, serviceType })
      } else {
        const p = buildProof(site, day, 'recue', [])
        cells.push({ siteId: site.id, day, status: 'recue', proofId: p.id, serviceType })
      }
    }
  }
  return cells
}

export const GRID: Cell[] = buildGrid()

export function getCell(siteId: string, day: number): Cell | undefined {
  return GRID.find((c) => c.siteId === siteId && c.day === day)
}

export function getProof(id: string): Proof | undefined {
  return proofsById.get(id)
}

export function getSite(id: string): Site | undefined {
  return SITES.find((s) => s.id === id)
}

export function getEmployee(id: string): Employee | undefined {
  return EMPLOYEES.find((e) => e.id === id)
}

// Un exemple de doublon observé (la même preuve envoyée deux fois).
export function getFeaturedProof(): Proof {
  const cell = GRID.find((c) => c.status === 'anomalie' && c.proofId)!
  return proofsById.get(cell.proofId!)!
}

// ── Vue « Aujourd'hui » ─────────────────────────────────────────────────────

export type TodayRow = {
  site: Site
  employee: Employee
  cell: Cell
}

export function todayRows(): TodayRow[] {
  return SITES.map((site) => {
    const cell = getCell(site.id, TODAY_DAY)!
    return { site, employee: getEmployee(site.employeeId)!, cell }
  }).filter((r) => r.cell.status !== 'non_requis' && r.cell.status !== 'ferie')
}

export type StatusMeta = { label: string; short: string; bg: string; fg: string; border: string }

export const STATUS_META: Record<CellStatus, StatusMeta> = {
  recue: { label: 'Reçue', short: '✓', bg: 'var(--cell-recue)', fg: 'var(--cell-recue-fg)', border: 'var(--cell-recue-fg)' },
  anomalie: { label: 'Anomalie', short: '!', bg: 'var(--cell-anomalie)', fg: 'var(--cell-anomalie-fg)', border: 'var(--cell-anomalie-fg)' },
  manquante: { label: 'Manquante', short: '✗', bg: 'var(--cell-manquante)', fg: 'var(--cell-manquante-fg)', border: 'var(--cell-manquante-fg)' },
  excusee: { label: 'Excusée', short: 'e', bg: 'var(--cell-excusee)', fg: 'var(--cell-excusee-fg)', border: 'var(--cell-excusee-fg)' },
  non_requis: { label: 'Non requis', short: '·', bg: 'var(--cell-weekend)', fg: 'var(--cell-weekend-fg)', border: 'var(--cell-weekend-fg)' },
  ferie: { label: 'Férié', short: 'F', bg: 'var(--cell-ferie)', fg: 'var(--cell-ferie-fg)', border: 'var(--cell-ferie-fg)' },
  attendue: { label: 'Attendue', short: '…', bg: 'var(--cell-excusee)', fg: 'var(--cell-excusee-fg)', border: 'var(--cell-excusee-fg)' },
  futur: { label: 'À venir', short: '', bg: 'transparent', fg: 'var(--cell-weekend-fg)', border: 'var(--border)' },
}

export type OutboundMessage = {
  id: string
  employee: Employee
  site: Site
  lang: 'fr' | 'en' | 'es'
  body: string
  status: 'simule' | 'envoye' | 'bloque' | 'escalade'
  skipReason?: string
}

const REMINDER_BODY: Record<'fr' | 'en' | 'es', (site: string, time: string) => string> = {
  fr: (site, time) => `Bonjour, nous n'avons pas encore reçu votre preuve ClearSite pour ${site} aujourd'hui. Merci de l'envoyer avant ${time}.`,
  en: (site, time) => `Hi, we have not received your ClearSite proof for ${site} today. Please send it before ${time}.`,
  es: (site, time) => `Hola, aún no recibimos su comprobante ClearSite de ${site} hoy. Envíelo antes de las ${time}, por favor.`,
}

export function todayReminders(): OutboundMessage[] {
  return todayRows()
    .filter((r) => r.cell.status === 'manquante' || r.cell.status === 'attendue')
    .map((r, i) => ({
      id: `m-${i}`,
      employee: r.employee,
      site: r.site,
      lang: r.employee.lang,
      body: REMINDER_BODY[r.employee.lang](r.site.name, r.site.heureLimite),
      status: 'simule' as const,
    }))
}
