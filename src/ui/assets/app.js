import React, { useEffect, useMemo, useState } from 'https://esm.sh/react@19.2.0';
import { createRoot } from 'https://esm.sh/react-dom@19.2.0/client';

  const phaseOrder = ['search', 'evaluation', 'negotiation', 'documentation', 'completed'];
  const phaseActionMap = {
    search: { endpoint: 'search', label: 'Esegui Search' },
    evaluation: { endpoint: 'evaluate', label: 'Esegui Evaluation' },
    negotiation: { endpoint: 'negotiate', label: 'Esegui Negotiation' },
    documentation: { endpoint: 'documentation', label: 'Esegui Documentation' },
    completed: { endpoint: 'complete', label: 'Completa Workflow' },
  };

  function prettyJson(value) {
    return JSON.stringify(value, null, 2);
  }

  function AgentCard({ agent }) {
    return React.createElement(
      'article',
      { className: 'agent' },
      React.createElement('h4', null, agent.name),
      React.createElement('p', null, agent.description),
    );
  }

  function PhaseTimeline({ currentPhase }) {
    return React.createElement(
      'div',
      { className: 'phase-grid' },
      phaseOrder.map((phase) => {
        const isCurrent = phase === currentPhase;
        const isDone = phaseOrder.indexOf(phase) < phaseOrder.indexOf(currentPhase || 'search');
        const badgeClass = isCurrent ? 'badge success' : isDone ? 'badge warn' : 'badge';

        return React.createElement(
          'div',
          { key: phase, className: 'status-line' },
          React.createElement('span', { className: badgeClass }, phase.toUpperCase()),
        );
      }),
    );
  }

  function App() {
    const [agents, setAgents] = useState([]);
    const [workflowState, setWorkflowState] = useState(null);
    const [history, setHistory] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState('');
    const [location, setLocation] = useState('Milano');
    const [budgetMin, setBudgetMin] = useState(200000);
    const [budgetMax, setBudgetMax] = useState(500000);
    const [loading, setLoading] = useState(false);
    const [lastResponse, setLastResponse] = useState(null);
    const [error, setError] = useState('');

    const currentPhase = workflowState?.phase || 'search';
    const canAct = Boolean(selectedUserId);
    const nextAction = useMemo(
      () => phaseActionMap[currentPhase] || phaseActionMap.search,
      [currentPhase],
    );

    useEffect(() => {
      fetch('/workflow/agents')
        .then((res) => res.json())
        .then((data) => setAgents(data))
        .catch(() => setError('Impossibile caricare gli agenti'));
    }, []);

    async function refreshState(userId = selectedUserId) {
      if (!userId) {
        return;
      }

      try {
        const [stateRes, historyRes] = await Promise.all([
          fetch(`/workflow/${userId}/state`),
          fetch(`/workflow/${userId}/history`),
        ]);

        if (!stateRes.ok) {
          throw new Error('Workflow non trovato');
        }

        const [state, progress] = await Promise.all([stateRes.json(), historyRes.json()]);
        setWorkflowState(state);
        setHistory(progress);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Errore nel refresh');
      }
    }

    async function startWorkflow() {
      setLoading(true);
      setError('');

      try {
        const response = await fetch('/workflow/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: selectedUserId || undefined,
            preferences: {
              location,
              budgetMin: Number(budgetMin),
              budgetMax: Number(budgetMax),
            },
          }),
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || 'Errore avvio workflow');
        }

        setSelectedUserId(data.userId);
        setWorkflowState(data);
        setLastResponse(data);
        await refreshState(data.userId);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Errore inatteso');
      } finally {
        setLoading(false);
      }
    }

    async function runPhase() {
      if (!selectedUserId) {
        setError('Avvia prima un workflow');
        return;
      }

      setLoading(true);
      setError('');

      try {
        const response = await fetch(`/workflow/${selectedUserId}/${nextAction.endpoint}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            location,
            budgetMin: Number(budgetMin),
            budgetMax: Number(budgetMax),
            propertyType: 'apartment',
            region: 'Lombardia',
          }),
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || `Errore in fase ${currentPhase}`);
        }

        setLastResponse(data);
        await refreshState(selectedUserId);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Errore inatteso');
      } finally {
        setLoading(false);
      }
    }

    return React.createElement(
      'main',
      { className: 'page' },
      React.createElement(
        'section',
        { className: 'hero' },
        React.createElement('h1', null, 'DomusAI Agent Console (React)'),
        React.createElement(
          'p',
          null,
          'Prima UI React per orchestrare Search, Evaluation, Negotiation e Documentation.',
        ),
      ),
      React.createElement(
        'div',
        { className: 'grid two' },
        React.createElement(
          'section',
          { className: 'card' },
          React.createElement('h2', null, 'Workflow Controller'),
          React.createElement(PhaseTimeline, { currentPhase }),
          React.createElement(
            'div',
            { className: 'row' },
            React.createElement(
              'label',
              null,
              'User ID',
              React.createElement('input', {
                value: selectedUserId,
                onChange: (e) => setSelectedUserId(e.target.value),
                placeholder: 'es. user-demo-001',
              }),
            ),
            React.createElement(
              'label',
              null,
              'Location',
              React.createElement('input', {
                value: location,
                onChange: (e) => setLocation(e.target.value),
              }),
            ),
          ),
          React.createElement(
            'div',
            { className: 'row' },
            React.createElement(
              'label',
              null,
              'Budget min',
              React.createElement('input', {
                type: 'number',
                value: budgetMin,
                onChange: (e) => setBudgetMin(Number(e.target.value)),
              }),
            ),
            React.createElement(
              'label',
              null,
              'Budget max',
              React.createElement('input', {
                type: 'number',
                value: budgetMax,
                onChange: (e) => setBudgetMax(Number(e.target.value)),
              }),
            ),
          ),
          React.createElement(
            'div',
            { className: 'row' },
            React.createElement(
              'button',
              { className: 'primary', onClick: startWorkflow, disabled: loading },
              loading ? 'Avvio...' : 'Avvia Workflow',
            ),
            React.createElement(
              'button',
              { onClick: runPhase, disabled: loading || !canAct },
              loading ? 'Esecuzione...' : nextAction.label,
            ),
            React.createElement(
              'button',
              { onClick: () => refreshState(), disabled: loading || !canAct },
              'Refresh Stato',
            ),
          ),
          error ? React.createElement('p', { className: 'badge danger' }, error) : null,
        ),
        React.createElement(
          'section',
          { className: 'card' },
          React.createElement('h2', null, 'Stato Corrente'),
          React.createElement('p', { className: 'muted' }, `Utente: ${selectedUserId || '-'}`),
          React.createElement('p', { className: 'muted' }, `Fase: ${currentPhase}`),
          React.createElement('p', { className: 'muted' }, `Eventi storici: ${history.length}`),
          React.createElement('h3', null, 'Ultima risposta API'),
          React.createElement(
            'pre',
            null,
            lastResponse ? prettyJson(lastResponse) : 'Nessuna risposta ancora',
          ),
        ),
      ),
      React.createElement(
        'section',
        { className: 'card' },
        React.createElement('h2', null, 'Agenti disponibili'),
        React.createElement(
          'div',
          { className: 'agents' },
          agents.map((agent) => React.createElement(AgentCard, { key: agent.name, agent })),
        ),
      ),
    );
  }

const root = createRoot(document.getElementById('root'));
root.render(React.createElement(App));
