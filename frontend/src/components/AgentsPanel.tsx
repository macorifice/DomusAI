import type { AgentInfo, WorkflowPhase } from '@/lib/api';
import styles from '@/app/page.module.css';

interface AgentsPanelProps {
  agents: AgentInfo[];
  currentPhase: WorkflowPhase;
  onAgentClick: (agent: {
    name: string;
    description: string;
    phase?: WorkflowPhase;
    status: 'active' | 'completed' | 'pending';
  }) => void;
}

const phaseAgentMap: Record<WorkflowPhase, string | null> = {
  search: 'SearchAgent',
  evaluation: 'EvaluationAgent',
  negotiation: 'NegotiationAgent',
  documentation: 'DocumentationAgent',
  completed: null,
};

const phaseOrder: WorkflowPhase[] = ['search', 'evaluation', 'negotiation', 'documentation', 'completed'];

const agentPhaseMap: Record<string, WorkflowPhase> = {
  SearchAgent: 'search',
  EvaluationAgent: 'evaluation',
  NegotiationAgent: 'negotiation',
  DocumentationAgent: 'documentation',
};

export function AgentsPanel({ agents, currentPhase, onAgentClick }: AgentsPanelProps) {
  const activeAgent = phaseAgentMap[currentPhase];
  const currentPhaseIndex = phaseOrder.indexOf(currentPhase);

  return (
    <section className={styles.card}>
      <div className={styles.cardHeader}>
        <h2>Agenti disponibili</h2>
        <span className={`${styles.badge} ${styles.badgeAvailable}`}>Pipeline</span>
      </div>
      <p className={styles.cardSubtitle}>Ogni agente si attiva nella sua fase del workflow.</p>
      <div className={styles.agentsGrid}>
        {agents.map((agent) => {
          const agentPhase = agentPhaseMap[agent.name];
          const agentPhaseIndex = agentPhase ? phaseOrder.indexOf(agentPhase) : -1;
          const isActive = activeAgent === agent.name;
          const isCompleted = !isActive && agentPhaseIndex !== -1 && agentPhaseIndex < currentPhaseIndex;
          const badgeClass = isActive ? styles.badgeAvailable : isCompleted ? styles.badgeDone : styles.badgeLocked;
          const badgeLabel = isActive ? 'Attivo ora' : isCompleted ? 'Completato' : 'In attesa';
          const status = isActive ? 'active' : isCompleted ? 'completed' : 'pending';
          return (
          <article
            key={agent.name}
            className={`${styles.agentCard} ${isActive ? styles.agentCardActive : ''} ${styles.clickableCard}`}
            role="button"
            tabIndex={0}
            onClick={() => onAgentClick({ name: agent.name, description: agent.description, phase: agentPhase, status })}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onAgentClick({ name: agent.name, description: agent.description, phase: agentPhase, status });
              }
            }}
          >
            <h4 className={styles.agentTitle}>{agent.name}</h4>
            <p className={styles.muted}>{agent.description}</p>
            <span className={`${styles.badge} ${badgeClass}`}>
              {badgeLabel}
            </span>
          </article>
          );
        })}
      </div>
    </section>
  );
}
