import type { WorkflowChecklist } from '@/lib/api';
import styles from '@/app/page.module.css';

interface ChecklistPanelProps {
  checklist: WorkflowChecklist;
  loading: boolean;
  onToggleStep: (stepId: string, done: boolean) => void;
  viewMode: 'guided' | 'compact';
}

function stateBadgeClass(state: string) {
  if (state === 'done') return `${styles.badge} ${styles.badgeDone}`;
  if (state === 'available') return `${styles.badge} ${styles.badgeAvailable}`;
  return `${styles.badge} ${styles.badgeLocked}`;
}

export function ChecklistPanel({ checklist, loading, onToggleStep, viewMode }: ChecklistPanelProps) {
  const doneSteps = checklist.steps.filter((step) => step.state === 'done');
  const availableSteps = checklist.steps.filter((step) => step.state === 'available');
  const lockedSteps = checklist.steps.filter((step) => step.state === 'locked');

  const groups = [
    { title: 'Da fare ora', steps: availableSteps },
    { title: 'Completati', steps: doneSteps },
    { title: 'Bloccati (fasi successive)', steps: lockedSteps },
  ];

  return (
    <>
      <div className={styles.checklistHeader}>
        <h3>Checklist operativa</h3>
        <span className={`${styles.badge} ${styles.badgeAvailable}`}>{doneSteps.length}/{checklist.steps.length}</span>
      </div>
      <p className={styles.muted}>Profilo mutuo: {checklist.meta.requiresMortgage ? 'attivo' : 'non richiesto'}</p>
      {checklist.steps.length === 0 ? <p className={styles.muted}>Nessuno step disponibile.</p> : null}
      {groups.map((group) =>
        group.steps.length > 0 ? (
          <section key={group.title} className={styles.checklistGroup}>
            <h4 className={styles.groupTitle}>{group.title}</h4>
            {group.steps.map((step) => (
              <div key={step.id} className={`${styles.checklistStep} ${step.state === 'locked' ? styles.checklistLocked : ''}`}>
                <p className={styles.stepTitle}>
                  {step.title} <span className={stateBadgeClass(step.state)}>{step.state.toUpperCase()}</span>
                  {step.parallelizable ? <span className={`${styles.badge} ${styles.badgeAvailable}`}>PARALLEL</span> : null}
                </p>
                {viewMode === 'guided' ? <p className={styles.stepText}>{step.description}</p> : null}
                {viewMode === 'guided' && step.dependsOnPhases?.length ? (
                  <p className={styles.muted}>Dipende da: {step.dependsOnPhases.join(', ')}</p>
                ) : null}
                <label className={`${styles.inlineField} ${styles.stepToggle}`}>
                  <input
                    className={styles.checkboxCustom}
                    type="checkbox"
                    checked={step.done}
                    disabled={step.state === 'locked' || loading}
                    onChange={(e) => onToggleStep(step.id, e.target.checked)}
                  />
                  {step.done ? 'Completato' : 'Segna come completato'}
                </label>
              </div>
            ))}
          </section>
        ) : null,
      )}
    </>
  );
}
