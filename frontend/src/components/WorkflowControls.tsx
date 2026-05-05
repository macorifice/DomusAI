import type { WorkflowPhase } from '@/lib/api';
import styles from '@/app/page.module.css';

interface WorkflowControlsProps {
  selectedUserId: string;
  isAuthenticated: boolean;
  location: string;
  budgetMin: number;
  budgetMax: number;
  requiresMortgage: boolean;
  dealType: string;
  loading: boolean;
  canRun: boolean;
  nextActionLabel: string;
  error: string;
  blockedByChecklist: boolean;
  blockingMessage?: string;
  onUserIdChange: (value: string) => void;
  onLocationChange: (value: string) => void;
  onBudgetMinChange: (value: number) => void;
  onBudgetMaxChange: (value: number) => void;
  onRequiresMortgageChange: (value: boolean) => void;
  onDealTypeChange: (value: string) => void;
  onStart: () => void;
  onRunPhase: () => void;
  onRefresh: () => void;
  currentPhase: WorkflowPhase;
  viewMode: 'guided' | 'compact';
  onViewModeChange: (value: 'guided' | 'compact') => void;
}

export function WorkflowControls({
  selectedUserId,
  isAuthenticated,
  location,
  budgetMin,
  budgetMax,
  requiresMortgage,
  dealType,
  loading,
  canRun,
  nextActionLabel,
  error,
  blockedByChecklist,
  blockingMessage,
  onUserIdChange,
  onLocationChange,
  onBudgetMinChange,
  onBudgetMaxChange,
  onRequiresMortgageChange,
  onDealTypeChange,
  onStart,
  onRunPhase,
  onRefresh,
  currentPhase,
  viewMode,
  onViewModeChange,
}: WorkflowControlsProps) {
  return (
    <section className={styles.card}>
      <div className={styles.cardHeader}>
        <h2>Workflow Controller</h2>
        <span className={`${styles.badge} ${styles.badgeAvailable}`}>Fase: {currentPhase}</span>
      </div>
      <p className={styles.cardSubtitle}>
        {viewMode === 'guided'
          ? 'Inserisci i parametri e guida il flusso passo per passo.'
          : 'Modalita compatta: focus su input essenziali e azioni rapide.'}
      </p>

      <div className={styles.viewModeSwitch}>
        <button
          className={viewMode === 'guided' ? styles.viewModeActive : styles.viewModeButton}
          onClick={() => onViewModeChange('guided')}
          type="button"
        >
          Guided
        </button>
        <button
          className={viewMode === 'compact' ? styles.viewModeActive : styles.viewModeButton}
          onClick={() => onViewModeChange('compact')}
          type="button"
        >
          Compact
        </button>
      </div>

      <div className={styles.row}>
        <label className={styles.field}>
          Utente workflow (sub)
          <input
            value={selectedUserId}
            onChange={(e) => onUserIdChange(e.target.value)}
            placeholder={isAuthenticated ? 'UUID Supabase' : 'Accedi per sbloccare il workflow'}
            disabled={!isAuthenticated}
            readOnly={isAuthenticated}
            aria-readonly={isAuthenticated}
          />
        </label>
        <label className={styles.field}>
          Location
          <input value={location} onChange={(e) => onLocationChange(e.target.value)} />
        </label>
      </div>

      <div className={styles.row}>
        <label className={styles.field}>
          Budget min
          <input type="number" value={budgetMin} onChange={(e) => onBudgetMinChange(Number(e.target.value))} />
        </label>
        <label className={styles.field}>
          Budget max
          <input type="number" value={budgetMax} onChange={(e) => onBudgetMaxChange(Number(e.target.value))} />
        </label>
      </div>

      <div className={styles.row}>
        <label className={styles.switchRow}>
          <button
            type="button"
            role="switch"
            aria-checked={requiresMortgage}
            className={`${styles.switchButton} ${requiresMortgage ? styles.switchOn : styles.switchOff}`}
            onClick={() => onRequiresMortgageChange(!requiresMortgage)}
          >
            <span className={styles.switchThumb} />
          </button>
          <span className={styles.switchLabel}>Clausola sospensiva mutuo</span>
        </label>
        <label className={styles.field}>
          Tipo accordo
          <select
            className={styles.fieldSelect}
            value={dealType}
            onChange={(e) => onDealTypeChange(e.target.value)}
            disabled={!requiresMortgage}
          >
            <option value="compromesso">compromesso</option>
            <option value="preliminare">preliminare</option>
            <option value="compromesso_finale">compromesso finale</option>
          </select>
        </label>
      </div>

      <div className={styles.actions}>
        <button className={styles.primary} onClick={onStart} disabled={loading || !isAuthenticated}>
          {loading ? 'Avvio...' : 'Avvia Workflow'}
        </button>
        <button onClick={onRunPhase} disabled={loading || !canRun || blockedByChecklist}>
          {loading ? 'Esecuzione...' : nextActionLabel}
        </button>
        <button onClick={onRefresh} disabled={loading || !canRun}>
          Refresh Stato
        </button>
      </div>

      {blockedByChecklist && blockingMessage ? <p className={styles.warning}>{blockingMessage}</p> : null}
      {error ? <p className={styles.error}>{error}</p> : null}
    </section>
  );
}
