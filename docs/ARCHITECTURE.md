# Architettura di DomusAI

## Panoramica

DomusAI è un workflow agentico intelligente che trasforma il processo di acquisto della casa in un'esperienza guidata e consapevole.

## Struttura del Progetto

```
DomusAI/
├── src/
│   ├── agents/           # Agenti intelligenti
│   ├── workflows/        # Orchestrazione del processo
│   ├── tools/            # Strumenti e utility
│   ├── models/           # Modelli dati
│   └── utils/            # Funzioni di supporto
├── tests/                # Test suite
├── config/               # Configurazioni
├── docs/                 # Documentazione
└── main.py              # Punto di ingresso
```

## Componenti Principali

### 1. Agenti (src/agents/)

Componenti intelligenti indipendenti che gestiscono fasi specifiche del processo:

- **SearchAgent**: Ricerca di proprietà immobiliari
- **EvaluationAgent**: Valutazione e analisi di proprietà
- **NegotiationAgent**: Gestione della negoziazione
- **DocumentationAgent**: Gestione della documentazione

Ogni agente:
- Eredita da BaseAgent
- Implementa il metodo `execute()`
- Mantiene uno stato interno

### 2. Workflow (src/workflows/)

Orchestrazione del processo di acquisto:

- **PurchaseWorkflow**: Coordina gli agenti attraverso le fasi del processo
- Gestisce lo storico delle azioni
- Mantiene lo stato globale

### 3. Modelli Dati (src/models/)

Strutture dati principali:

- **Property**: Rappresentazione di una proprietà immobiliare
- **UserProfile**: Profilo dell'acquirente
- **Transaction**: Dati della transazione

### 4. Tools (src/tools/)

Strumenti specializzati per gli agenti:

- **PropertyLocator**: Ricerca e localizzazione proprietà
- **MarketAnalyzer**: Analisi del mercato
- **DocumentChecker**: Verifiche documentali

## Flusso di Lavoro

```
1. RICERCA
   └─> SearchAgent ricerca proprietà
       └─> PropertyLocator fornisce dati

2. VALUTAZIONE
   └─> EvaluationAgent analizza proprietà
       └─> MarketAnalyzer calcola valore

3. NEGOZIAZIONE
   └─> NegotiationAgent suggerisce strategie
       └─> Gestione delle controproposte

4. DOCUMENTAZIONE
   └─> DocumentationAgent prepara checklist
       └─> DocumentChecker verifica completezza
```

## Come Estendere

### Aggiungere un Nuovo Agente

1. Creare una classe che eredita da BaseAgent
2. Implementare il metodo execute()
3. Registrare l'agente nel workflow

### Aggiungere un Nuovo Tool

1. Creare una classe in src/tools/
2. Implementare i metodi statici per le operazioni
3. Importare e utilizzare negli agenti

## Prossimi Passi

- [ ] Implementare interfaccia CLI
- [ ] Aggiungere integrazione con API immobiliari
- [ ] Implementare modelli LLM per AI
- [ ] Aggiungere autenticazione utente
- [ ] Creare dashboard web
- [ ] Implementare database persistente
