'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { workflowApi, type AgentInfo, type WorkflowChecklist, type WorkflowPhase, type WorkflowState } from '@/lib/api';
import { WorkflowControls } from '@/components/WorkflowControls';
import { ChecklistPanel } from '@/components/ChecklistPanel';
import { AgentsPanel } from '@/components/AgentsPanel';
import styles from './page.module.css';

const phaseActionMap: Record<WorkflowPhase, { endpoint: string; label: string }> = {
  search: { endpoint: 'search', label: 'Esegui Search' },
  evaluation: { endpoint: 'evaluate', label: 'Esegui Evaluation' },
  negotiation: { endpoint: 'negotiate', label: 'Esegui Negotiation' },
  documentation: { endpoint: 'documentation', label: 'Esegui Documentation' },
  completed: { endpoint: 'complete', label: 'Completa Workflow' },
};

function prettyJson(value: unknown) {
  return JSON.stringify(value, null, 2);
}

type ListingCard = {
  id: string;
  title: string;
  location: string;
  price?: number;
  area?: number;
  rooms?: number;
  score?: number;
  source?: string;
  imageUrl?: string;
  imageUrls: string[];
  description?: string;
  amenities?: string[];
  latitude?: number;
  longitude?: number;
  marketPosition?: string;
  negotiationHint?: string;
};
type ListingSort = 'domus-score' | 'price-asc' | 'price-desc' | 'area-desc';
type AgentCardStatus = 'active' | 'completed' | 'pending';
type AgentCardDetail = {
  name: string;
  description: string;
  phase?: WorkflowPhase;
  status: AgentCardStatus;
};
type OverlayState =
  | { isOpen: false; type: null; payload: null }
  | { isOpen: true; type: 'listing'; payload: ListingCard }
  | { isOpen: true; type: 'agent'; payload: AgentCardDetail };

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function getNumber(record: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'number' && Number.isFinite(value)) return value;
  }
  return undefined;
}

function getString(record: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'string' && value.trim().length > 0) return value;
  }
  return undefined;
}

function getStringArray(record: Record<string, unknown>, key: string) {
  const value = record[key];
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function deriveDomusScore(row: Record<string, unknown>): number | undefined {
  const market = asRecord(row.market);
  const rulesEvaluation = asRecord(row.rulesEvaluation);
  const outcomes = Array.isArray(rulesEvaluation?.outcomes) ? rulesEvaluation.outcomes : [];
  const amenities = Array.isArray(row.amenities) ? row.amenities : [];
  const condition = getString(row, ['condition']);

  let score = 68;

  const deltaPctRaw = market?.deltaPct;
  if (typeof deltaPctRaw === 'number' && Number.isFinite(deltaPctRaw)) {
    // Sotto mercato => score piu alto, sopra mercato => penalita.
    score += clamp((-deltaPctRaw * 0.9), -18, 18);
  }

  if (rulesEvaluation?.pass === true) {
    score += 6;
  }
  if (outcomes.length > 0) {
    const passedRules = outcomes.filter((outcome) => asRecord(outcome)?.pass === true).length;
    score += passedRules * 2;
  }

  if (condition === 'new') score += 8;
  if (condition === 'renovated') score += 5;
  if (condition === 'to_renovate') score -= 6;

  score += clamp(amenities.length, 0, 6);
  return Math.round(clamp(score, 35, 99));
}

function extractListings(payload: unknown): ListingCard[] {
  const payloadRecord = asRecord(payload);
  if (!payloadRecord) return [];
  const nestedData = asRecord(payloadRecord.data);
  const nestedResult = asRecord(payloadRecord.result);
  const candidates =
    payloadRecord.properties ??
    payloadRecord.listings ??
    payloadRecord.results ??
    nestedData?.properties ??
    nestedData?.listings ??
    nestedData?.results ??
    nestedResult?.properties ??
    nestedResult?.listings ??
    nestedResult?.results;
  if (!Array.isArray(candidates)) return [];

  return candidates.reduce<ListingCard[]>((acc, item, index) => {
      const row = asRecord(item);
      if (!row) return acc;
      const price = getNumber(row, ['price', 'askingPrice', 'estimatedPrice']);
      const area = getNumber(row, ['area', 'surface', 'sqm']);
      const rooms = getNumber(row, ['rooms', 'locali']);
      const score = getNumber(row, ['domusScore', 'score', 'matchScore']) ?? deriveDomusScore(row);
      const title = getString(row, ['title', 'address', 'name']) || `Proposta ${index + 1}`;
      const location = getString(row, ['city', 'zone', 'address']) || 'Localita non specificata';
      const source = getString(row, ['source', 'portal', 'provider']);
      const imageCandidates = [
        getString(row, ['coverImage', 'imageUrl', 'thumbnail']),
        ...getStringArray(row, 'images'),
      ].filter((item): item is string => Boolean(item));
      const imageUrl = imageCandidates[0];
      const market = asRecord(row.market);

      acc.push({
        id: getString(row, ['id', 'externalId']) || `${title}-${index}`,
        title,
        location,
        price,
        area,
        rooms,
        score,
        source,
        imageUrl,
        imageUrls: imageCandidates,
        description: getString(row, ['description', 'summary', 'note']),
        amenities: Array.isArray(row.amenities) ? row.amenities.filter((item): item is string => typeof item === 'string') : [],
        latitude: getNumber(row, ['latitude', 'lat']),
        longitude: getNumber(row, ['longitude', 'lng']),
        marketPosition: getString(market ?? {}, ['marketPosition']),
        negotiationHint: getString(market ?? {}, ['negotiationHint']),
      });
      return acc;
    }, []);
}

function formatCurrency(value?: number) {
  if (typeof value !== 'number') return 'Prezzo non disponibile';
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value);
}

export default function Page() {
  const [agents, setAgents] = useState<AgentInfo[]>([]);
  const [workflowState, setWorkflowState] = useState<WorkflowState | null>(null);
  const [history, setHistory] = useState<unknown[]>([]);
  const [checklist, setChecklist] = useState<WorkflowChecklist>({ steps: [], meta: {} });
  const [selectedUserId, setSelectedUserId] = useState('');
  const [location, setLocation] = useState('Milano');
  const [budgetMin, setBudgetMin] = useState(200000);
  const [budgetMax, setBudgetMax] = useState(500000);
  const [requiresMortgage, setRequiresMortgage] = useState(false);
  const [dealType, setDealType] = useState('compromesso');
  const [loading, setLoading] = useState(false);
  const [lastResponse, setLastResponse] = useState<unknown>(null);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState<'guided' | 'compact'>('guided');
  const [showCompactJson, setShowCompactJson] = useState(false);
  const [showGuidedJson, setShowGuidedJson] = useState(false);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const [listingSort, setListingSort] = useState<ListingSort>('domus-score');
  const [onlyWithImage, setOnlyWithImage] = useState(false);
  const [selectedSource, setSelectedSource] = useState('all');
  const [minScore, setMinScore] = useState(0);
  const [overlay, setOverlay] = useState<OverlayState>({ isOpen: false, type: null, payload: null });
  const [overlayImageIndex, setOverlayImageIndex] = useState(0);
  const lastFocusedRef = useRef<HTMLElement | null>(null);

  const currentPhase: WorkflowPhase = workflowState?.phase || 'search';
  const nextAction = useMemo(() => phaseActionMap[currentPhase], [currentPhase]);
  const blockingSteps = useMemo(
    () =>
      checklist.steps.filter((step) => step.state === 'available' && step.priority !== 'optional' && step.done !== true),
    [checklist.steps],
  );
  const blockedByChecklist = blockingSteps.length > 0;
  const blockingMessage = blockedByChecklist
    ? `Per procedere completa prima: ${blockingSteps.map((step) => step.title).join(', ')}`
    : '';
  const listings = useMemo(() => extractListings(lastResponse), [lastResponse]);
  const bestListingId = useMemo(() => {
    if (listings.length === 0) return null;
    let best = listings[0];
    let bestScore = typeof best.score === 'number' ? best.score : Number.NEGATIVE_INFINITY;
    for (let i = 1; i < listings.length; i += 1) {
      const current = listings[i];
      const currentScore = typeof current.score === 'number' ? current.score : Number.NEGATIVE_INFINITY;
      if (currentScore > bestScore) {
        best = current;
        bestScore = currentScore;
      }
    }
    return best.id;
  }, [listings]);
  const availableSources = useMemo(() => {
    const set = new Set<string>();
    listings.forEach((listing) => {
      if (listing.source) set.add(listing.source);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [listings]);
  const displayedListings = useMemo(() => {
    const filtered = listings.filter((listing) => {
      const sourceMatch = selectedSource === 'all' || listing.source === selectedSource;
      const hasImage = Boolean(listing.imageUrl) && !imageErrors[listing.id];
      const imageMatch = !onlyWithImage || hasImage;
      const scoreMatch = minScore <= 0 || (listing.score ?? 0) >= minScore;
      return sourceMatch && imageMatch && scoreMatch;
    });

    const sorted = [...filtered].sort((a, b) => {
      if (listingSort === 'price-asc') return (a.price ?? Number.POSITIVE_INFINITY) - (b.price ?? Number.POSITIVE_INFINITY);
      if (listingSort === 'price-desc') return (b.price ?? Number.NEGATIVE_INFINITY) - (a.price ?? Number.NEGATIVE_INFINITY);
      if (listingSort === 'area-desc') return (b.area ?? Number.NEGATIVE_INFINITY) - (a.area ?? Number.NEGATIVE_INFINITY);
      return (b.score ?? Number.NEGATIVE_INFINITY) - (a.score ?? Number.NEGATIVE_INFINITY);
    });
    return sorted;
  }, [imageErrors, listingSort, listings, minScore, onlyWithImage, selectedSource]);

  function onListingImageError(listingId: string) {
    setImageErrors((prev) => ({ ...prev, [listingId]: true }));
  }

  function openListingDetail(listing: ListingCard) {
    lastFocusedRef.current = (document.activeElement as HTMLElement) ?? null;
    setOverlayImageIndex(0);
    setOverlay({ isOpen: true, type: 'listing', payload: listing });
  }

  function openAgentDetail(agent: AgentCardDetail) {
    lastFocusedRef.current = (document.activeElement as HTMLElement) ?? null;
    setOverlay({ isOpen: true, type: 'agent', payload: agent });
  }

  function closeDetail() {
    setOverlay({ isOpen: false, type: null, payload: null });
    setOverlayImageIndex(0);
    window.requestAnimationFrame(() => {
      lastFocusedRef.current?.focus?.();
    });
  }

  useEffect(() => {
    workflowApi.getAgents().then(setAgents).catch(() => setError('Impossibile caricare gli agenti'));
  }, []);

  useEffect(() => {
    if (!overlay.isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeDetail();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [overlay.isOpen]);

  async function refreshState(userId = selectedUserId) {
    if (!userId) return;
    const [state, progress, checklistPayload] = await Promise.all([
      workflowApi.getState(userId),
      workflowApi.getHistory(userId),
      workflowApi.getChecklist(userId),
    ]);
    setWorkflowState(state);
    setHistory(progress);
    setChecklist(checklistPayload);
  }

  async function startWorkflow() {
    setLoading(true);
    setError('');
    try {
      const state = await workflowApi.startWorkflow({
        userId: selectedUserId || undefined,
        preferences: { location, budgetMin: Number(budgetMin), budgetMax: Number(budgetMax), requiresMortgage, dealType },
      });
      setSelectedUserId(state.userId);
      setLastResponse(state);
      await refreshState(state.userId);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Errore avvio workflow');
    } finally {
      setLoading(false);
    }
  }

  async function runPhase() {
    if (!selectedUserId) return;
    setLoading(true);
    setError('');
    try {
      const result = await workflowApi.runWorkflowPhase(selectedUserId, nextAction.endpoint, {
        location,
        budgetMin: Number(budgetMin),
        budgetMax: Number(budgetMax),
        propertyType: 'apartment',
        region: 'Lombardia',
      });
      setLastResponse(result);
      await refreshState(selectedUserId);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Errore esecuzione fase';
      setError(message);
      if (typeof window !== 'undefined') {
        window.alert(message);
      }
    } finally {
      setLoading(false);
    }
  }

  async function toggleStep(stepId: string, done: boolean) {
    if (!selectedUserId) return;
    setLoading(true);
    setError('');
    try {
      const updated = await workflowApi.setChecklistStepStatus(selectedUserId, stepId, done);
      setChecklist(updated);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Errore aggiornamento checklist');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className={viewMode === 'compact' ? styles.compactMode : styles.guidedMode}>
      <section className={styles.hero}>
        <span className={styles.brandKicker}>DomusAI Signature Edition</span>
        <h1>DomusAI Home Buyer Copilot</h1>
        <p>
          {viewMode === 'guided'
            ? 'Esperienza premium per ricerca, valutazione e negoziazione immobiliare assistita.'
            : 'Vista operativa compatta con insight essenziali in tempo reale.'}
        </p>
      </section>

      {viewMode === 'guided' ? (
        <div className={styles.wizardStack}>
          <section className={styles.wizardSection}>
            <p className={styles.wizardStep}>STEP 1</p>
            <WorkflowControls
              selectedUserId={selectedUserId}
              location={location}
              budgetMin={budgetMin}
              budgetMax={budgetMax}
              requiresMortgage={requiresMortgage}
              dealType={dealType}
              loading={loading}
              canRun={Boolean(selectedUserId)}
              nextActionLabel={nextAction.label}
              error={error}
              blockedByChecklist={blockedByChecklist}
              blockingMessage={blockingMessage}
              onUserIdChange={setSelectedUserId}
              onLocationChange={setLocation}
              onBudgetMinChange={setBudgetMin}
              onBudgetMaxChange={setBudgetMax}
              onRequiresMortgageChange={setRequiresMortgage}
              onDealTypeChange={setDealType}
              onStart={startWorkflow}
              onRunPhase={runPhase}
              onRefresh={() => refreshState()}
              currentPhase={currentPhase}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
            />
          </section>

          <section className={styles.wizardSection}>
            <p className={styles.wizardStep}>STEP 2</p>
            <section className={styles.card}>
              <div className={styles.cardHeader}>
                <h2>Checklist progressiva</h2>
                <span className={`${styles.badge} ${styles.badgeAvailable}`}>{currentPhase.toUpperCase()}</span>
              </div>
              <ChecklistPanel checklist={checklist} loading={loading} onToggleStep={toggleStep} viewMode={viewMode} />
            </section>
          </section>

          <section className={styles.wizardSection}>
            <p className={styles.wizardStep}>STEP 3</p>
            <section className={styles.card}>
              <div className={styles.cardHeader}>
                <h2>Risultato e stato</h2>
                <span className={`${styles.badge} ${styles.badgeAvailable}`}>{currentPhase.toUpperCase()}</span>
              </div>
              <div className={styles.statusGrid}>
                <div className={styles.metric}>
                  <span className={styles.metricLabel}>Utente</span>
                  <span className={styles.metricValue}>{selectedUserId || '-'}</span>
                </div>
                <div className={styles.metric}>
                  <span className={styles.metricLabel}>Eventi storici</span>
                  <span className={styles.metricValue}>{history.length}</span>
                </div>
              </div>
              <h3>Ultima risposta API</h3>
              {lastResponse ? (
                <>
                  {listings.length > 0 ? (
                    <>
                      <div className={styles.listingToolbar}>
                        <div className={styles.toolbarGroup}>
                          <label className={styles.toolbarField}>
                            <span className={styles.toolbarLabel}>Ordina per</span>
                            <select
                              className={styles.toolbarSelect}
                              value={listingSort}
                              onChange={(e) => setListingSort(e.target.value as ListingSort)}
                            >
                              <option value="domus-score">DomusScore (alto-basso)</option>
                              <option value="price-asc">Prezzo (basso-alto)</option>
                              <option value="price-desc">Prezzo (alto-basso)</option>
                              <option value="area-desc">Metri quadri (alto-basso)</option>
                            </select>
                          </label>
                          <label className={styles.toolbarField}>
                            <span className={styles.toolbarLabel}>Fonte</span>
                            <select
                              className={styles.toolbarSelect}
                              value={selectedSource}
                              onChange={(e) => setSelectedSource(e.target.value)}
                            >
                              <option value="all">Tutte</option>
                              {availableSources.map((source) => (
                                <option key={source} value={source}>
                                  {source}
                                </option>
                              ))}
                            </select>
                          </label>
                        </div>
                        <div className={styles.toolbarGroup}>
                          <button
                            type="button"
                            className={`${styles.filterChip} ${onlyWithImage ? styles.filterChipActive : ''}`}
                            onClick={() => setOnlyWithImage((prev) => !prev)}
                          >
                            Solo con immagine
                          </button>
                          <button
                            type="button"
                            className={`${styles.filterChip} ${minScore > 0 ? styles.filterChipActive : ''}`}
                            onClick={() => setMinScore((prev) => (prev > 0 ? 0 : 75))}
                          >
                            Score almeno 75
                          </button>
                          <span className={styles.toolbarCount}>{displayedListings.length} risultati</span>
                        </div>
                      </div>

                      {displayedListings.length === 0 ? (
                        <p className={styles.muted}>Nessun risultato con i filtri correnti. Prova ad allentare i filtri.</p>
                      ) : (
                        <div className={styles.listingsGrid}>
                          {displayedListings.map((listing) => (
                        <article
                          key={listing.id}
                          className={`${styles.listingCard} ${styles.clickableCard}`}
                          role="button"
                          tabIndex={0}
                          onClick={() => openListingDetail(listing)}
                          onKeyDown={(event) => {
                            if (event.key === 'Enter' || event.key === ' ') {
                              event.preventDefault();
                              openListingDetail(listing);
                            }
                          }}
                        >
                          <div className={styles.listingMedia}>
                            {bestListingId === listing.id ? (
                              <span className={styles.bestMatchBadge}>Best match DomusAI</span>
                            ) : null}
                            {listing.source ? <span className={styles.sourceChip}>{listing.source}</span> : null}
                            {listing.imageUrl && !imageErrors[listing.id] ? (
                              <>
                                <Image
                                  src={listing.imageUrl}
                                  alt={listing.title}
                                  className={styles.listingImage}
                                  width={640}
                                  height={360}
                                  unoptimized
                                  onError={() => onListingImageError(listing.id)}
                                />
                                <div className={styles.listingImageOverlay} />
                              </>
                            ) : (
                              <div className={styles.listingPlaceholder}>
                                <span className={styles.placeholderTag}>DomusAI Selection</span>
                                <p className={styles.placeholderAddress}>{listing.location}</p>
                              </div>
                            )}
                          </div>
                          <div className={styles.listingBody}>
                            <p className={styles.listingTitle}>{listing.title}</p>
                            <p className={styles.muted}>{listing.location}</p>
                            <p className={styles.listingPrice}>{formatCurrency(listing.price)}</p>
                            <div className={styles.listingMeta}>
                              <span>{listing.rooms ? `${listing.rooms} locali` : 'Locali n/d'}</span>
                              <span>{listing.area ? `${listing.area} m2` : 'Metratura n/d'}</span>
                              <span className={styles.scoreChip}>
                                {listing.score ? `DomusScore ${Math.round(listing.score)}` : 'DomusScore n/d'}
                              </span>
                            </div>
                          </div>
                        </article>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <p className={styles.muted}>Risposta strutturata disponibile: visualizzazione card non applicabile a questa fase.</p>
                  )}
                  <button
                    type="button"
                    className={styles.secondaryButton}
                    onClick={() => setShowGuidedJson((prev) => !prev)}
                  >
                    {showGuidedJson ? 'Nascondi JSON tecnico' : 'Mostra JSON tecnico'}
                  </button>
                  {showGuidedJson ? <pre className={styles.pre}>{prettyJson(lastResponse)}</pre> : null}
                </>
              ) : (
                <pre className={styles.pre}>Nessuna risposta ancora</pre>
              )}
            </section>
          </section>
        </div>
      ) : (
        <div className={styles.dashboardRow}>
          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <h2>Azioni</h2>
              <div className={styles.viewModeSwitch}>
                <button className={styles.viewModeButton} onClick={() => setViewMode('guided')} type="button">
                  Guided
                </button>
                <button className={styles.viewModeActive} onClick={() => setViewMode('compact')} type="button">
                  Compact
                </button>
              </div>
            </div>
            <div className={styles.row}>
              <label className={styles.field}>
                User ID
                <input value={selectedUserId} onChange={(e) => setSelectedUserId(e.target.value)} />
              </label>
              <label className={styles.field}>
                Location
                <input value={location} onChange={(e) => setLocation(e.target.value)} />
              </label>
            </div>
            <div className={styles.actions}>
              <button className={styles.primary} onClick={startWorkflow} disabled={loading}>
                Start
              </button>
              <button onClick={runPhase} disabled={loading || !selectedUserId || blockedByChecklist}>
                {nextAction.label}
              </button>
              <button onClick={() => refreshState()} disabled={loading || !selectedUserId}>
                Refresh
              </button>
            </div>
            {blockedByChecklist && blockingMessage ? <p className={styles.warning}>{blockingMessage}</p> : null}
            {error ? <p className={styles.error}>{error}</p> : null}
          </section>

          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <h2>Checklist</h2>
              <span className={`${styles.badge} ${styles.badgeAvailable}`}>{currentPhase.toUpperCase()}</span>
            </div>
            <ChecklistPanel checklist={checklist} loading={loading} onToggleStep={toggleStep} viewMode={viewMode} />
          </section>

          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <h2>Stato rapido</h2>
              <span className={`${styles.badge} ${styles.badgeAvailable}`}>{currentPhase.toUpperCase()}</span>
            </div>
            <div className={styles.statusGrid}>
              <div className={styles.metric}>
                <span className={styles.metricLabel}>Utente</span>
                <span className={styles.metricValue}>{selectedUserId || '-'}</span>
              </div>
              <div className={styles.metric}>
                <span className={styles.metricLabel}>Eventi</span>
                <span className={styles.metricValue}>{history.length}</span>
              </div>
            </div>
            <p className={styles.muted}>
              {lastResponse ? 'Risultato disponibile. Apri il JSON solo quando serve.' : 'Nessuna risposta disponibile.'}
            </p>
            {listings.length > 0 ? (
              displayedListings.length === 0 ? (
                <p className={styles.muted}>Nessun risultato con i filtri correnti.</p>
              ) : (
                <div className={styles.compactListingsGrid}>
                  {displayedListings.slice(0, 6).map((listing) => (
                    <article
                      key={`compact-${listing.id}`}
                      className={`${styles.listingCard} ${styles.clickableCard}`}
                      role="button"
                      tabIndex={0}
                      onClick={() => openListingDetail(listing)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          openListingDetail(listing);
                        }
                      }}
                    >
                      <div className={styles.listingMedia}>
                        {bestListingId === listing.id ? <span className={styles.bestMatchBadge}>Best match</span> : null}
                        {listing.source ? <span className={styles.sourceChip}>{listing.source}</span> : null}
                        {listing.imageUrl && !imageErrors[listing.id] ? (
                          <>
                            <Image
                              src={listing.imageUrl}
                              alt={listing.title}
                              className={styles.listingImage}
                              width={640}
                              height={360}
                              unoptimized
                              onError={() => onListingImageError(listing.id)}
                            />
                            <div className={styles.listingImageOverlay} />
                          </>
                        ) : (
                          <div className={styles.listingPlaceholder}>
                            <span className={styles.placeholderTag}>DomusAI Selection</span>
                            <p className={styles.placeholderAddress}>{listing.location}</p>
                          </div>
                        )}
                      </div>
                      <div className={styles.listingBody}>
                        <p className={styles.listingTitle}>{listing.title}</p>
                        <p className={styles.listingPrice}>{formatCurrency(listing.price)}</p>
                        <div className={styles.listingMeta}>
                          <span>{listing.rooms ? `${listing.rooms} loc` : 'loc n/d'}</span>
                          <span>{listing.area ? `${listing.area} m2` : 'm2 n/d'}</span>
                          <span className={styles.scoreChip}>{listing.score ? `Score ${Math.round(listing.score)}` : 'Score n/d'}</span>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )
            ) : null}
            {lastResponse ? (
              <>
                <button
                  type="button"
                  className={styles.secondaryButton}
                  onClick={() => setShowCompactJson((prev) => !prev)}
                >
                  {showCompactJson ? 'Nascondi JSON' : 'Mostra JSON'}
                </button>
                {showCompactJson ? <pre className={styles.pre}>{prettyJson(lastResponse)}</pre> : null}
              </>
            ) : null}
          </section>
        </div>
      )}

      <AgentsPanel agents={agents} currentPhase={currentPhase} onAgentClick={openAgentDetail} />

      {overlay.isOpen ? (
        <div className={styles.overlayBackdrop} onClick={closeDetail}>
          <section
            className={styles.overlayModal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="detail-overlay-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button className={styles.overlayClose} type="button" onClick={closeDetail} aria-label="Chiudi dettaglio">
              Chiudi
            </button>

            {overlay.type === 'listing' ? (
              <>
                <div className={styles.overlayHeader}>
                  <h3 id="detail-overlay-title">{overlay.payload.title}</h3>
                  <span className={`${styles.badge} ${styles.badgeAvailable}`}>{overlay.payload.source || 'Aggregata'}</span>
                </div>
                {overlay.payload.imageUrls.length > 1 ? (
                  <div className={styles.carouselControls}>
                    <button
                      type="button"
                      className={styles.carouselButton}
                      onClick={() =>
                        setOverlayImageIndex((prev) =>
                          prev === 0 ? overlay.payload.imageUrls.length - 1 : prev - 1,
                        )
                      }
                    >
                      Prev
                    </button>
                    <span className={styles.muted}>
                      {overlayImageIndex + 1}/{overlay.payload.imageUrls.length}
                    </span>
                    <button
                      type="button"
                      className={styles.carouselButton}
                      onClick={() =>
                        setOverlayImageIndex((prev) =>
                          prev === overlay.payload.imageUrls.length - 1 ? 0 : prev + 1,
                        )
                      }
                    >
                      Next
                    </button>
                  </div>
                ) : null}
                <div className={styles.overlayMedia}>
                  {overlay.payload.imageUrls[overlayImageIndex] && !imageErrors[`${overlay.payload.id}-${overlayImageIndex}`] ? (
                    <Image
                      src={overlay.payload.imageUrls[overlayImageIndex]}
                      alt={overlay.payload.title}
                      className={styles.overlayImage}
                      width={1200}
                      height={700}
                      unoptimized
                      onError={() => onListingImageError(`${overlay.payload.id}-${overlayImageIndex}`)}
                    />
                  ) : (
                    <div className={styles.listingPlaceholder}>
                      <span className={styles.placeholderTag}>DomusAI Selection</span>
                      <p className={styles.placeholderAddress}>{overlay.payload.location}</p>
                    </div>
                  )}
                </div>
                <p className={styles.muted}>{overlay.payload.location}</p>
                <p className={styles.overlayPrice}>{formatCurrency(overlay.payload.price)}</p>
                <div className={styles.overlayMeta}>
                  <span>{overlay.payload.rooms ? `${overlay.payload.rooms} locali` : 'Locali n/d'}</span>
                  <span>{overlay.payload.area ? `${overlay.payload.area} m2` : 'Metratura n/d'}</span>
                  <span className={styles.scoreChip}>
                    {overlay.payload.score ? `DomusScore ${Math.round(overlay.payload.score)}` : 'DomusScore n/d'}
                  </span>
                  {overlay.payload.marketPosition ? <span>{overlay.payload.marketPosition}</span> : null}
                </div>
                {overlay.payload.description ? <p className={styles.overlayDescription}>{overlay.payload.description}</p> : null}
                {overlay.payload.amenities?.length ? (
                  <div className={styles.overlayChips}>
                    {overlay.payload.amenities.slice(0, 8).map((amenity) => (
                      <span key={amenity} className={styles.overlayChip}>
                        {amenity}
                      </span>
                    ))}
                  </div>
                ) : null}
                {overlay.payload.negotiationHint ? <p className={styles.muted}>{overlay.payload.negotiationHint}</p> : null}
                {typeof overlay.payload.latitude === 'number' && typeof overlay.payload.longitude === 'number' ? (
                  <p className={styles.muted}>
                    Coordinate: {overlay.payload.latitude.toFixed(4)}, {overlay.payload.longitude.toFixed(4)}
                  </p>
                ) : null}
              </>
            ) : (
              <>
                <div className={styles.overlayHeader}>
                  <h3 id="detail-overlay-title">{overlay.payload.name}</h3>
                  <span
                    className={`${styles.badge} ${
                      overlay.payload.status === 'active'
                        ? styles.badgeAvailable
                        : overlay.payload.status === 'completed'
                          ? styles.badgeDone
                          : styles.badgeLocked
                    }`}
                  >
                    {overlay.payload.status === 'active'
                      ? 'Attivo ora'
                      : overlay.payload.status === 'completed'
                        ? 'Completato'
                        : 'In attesa'}
                  </span>
                </div>
                <p className={styles.overlayDescription}>{overlay.payload.description}</p>
                <div className={styles.overlayMeta}>
                  <span>Fase associata</span>
                  <span>{overlay.payload.phase || 'n/d'}</span>
                </div>
                <p className={styles.muted}>
                  Questo agente contribuisce al workflow in maniera specializzata, con output orientato alla fase corrente.
                </p>
              </>
            )}
          </section>
        </div>
      ) : null}
    </main>
  );
}
