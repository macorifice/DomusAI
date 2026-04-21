# DomusAI

**Workflow agentico intelligente per l'acquisto della casa** 🏡

DomusAI è un'applicazione basata su **agenti agentic workflow** costruita in **TypeScript/NestJS** che ti accompagna in ogni fase dell'acquisto della casa, trasformando un processo complesso e frammentato in un'esperienza semplice, guidata e consapevole.

## 🎯 Obbiettivi

- 🔍 **Ricerca Intelligente**: Trova le proprietà perfette in base alle tue preferenze
- 📊 **Valutazione Esperta**: Analizza il valore di mercato e identifica opportunità
- 💬 **Negoziazione Assistita**: Ricevi strategie per ottenere i migliori termini
- 📋 **Gestione Documentale**: Organizza e verifica tutta la documentazione richiesta

## 🚀 Tecnologie

- **Runtime**: Node.js
- **Framework**: NestJS
- **Linguaggio**: TypeScript
- **Testing**: Jest
- **Build**: TypeScript Compiler

## 📁 Struttura del Progetto

```
domusai/
├── src/
│   ├── agents/              # Agenti intelligenti
│   │   ├── search.agent.ts
│   │   ├── evaluation.agent.ts
│   │   ├── negotiation.agent.ts
│   │   ├── documentation.agent.ts
│   │   └── base.agent.ts
│   ├── workflows/           # Orchestrazione del workflow
│   │   └── purchase-workflow.service.ts
│   ├── tools/              # Servizi e tool specializzati
│   │   ├── property-locator.service.ts
│   │   ├── market-analyzer.service.ts
│   │   └── document-checker.service.ts
│   ├── models/             # Modelli dati e interfacce
│   │   └── types.ts
│   ├── common/             # Utilità comuni
│   ├── app.module.ts       # Modulo principale
│   └── main.ts             # Entry point
├── test/                   # Test suite
├── config/                 # Configurazioni
├── docs/                   # Documentazione
└── package.json
```

## 🏗️ Architettura

### 4 Agenti Agentic

1. **SearchAgent** 🔍
   - Ricerca proprietà per criteri specifici (location, budget, tipo)
   - Filtraggio e ranking automatico
   - Integrazione con API immobiliari

2. **EvaluationAgent** 📊
   - Valutazione di mercato
   - Analisi di rischi
   - Comparazione con proprietà simili
   - Generazione di raccomandazioni

3. **NegotiationAgent** 💼
   - Strategie di offerta intelligenti
   - Analisi della posizione negoziale
   - Suggerimenti per i termini
   - Timeline e consigli

4. **DocumentationAgent** 📋
   - Checklist documentale dinamica
   - Verifiche di completezza
   - Gestione dello stato del documento
   - Next steps automatici

### PurchaseWorkflow

Orchestra i 4 agenti attraverso le fasi del processo:

```
SEARCH → EVALUATION → NEGOTIATION → DOCUMENTATION → COMPLETED
```

## 🚦 Quick Start

### Setup

```bash
# Installa dipendenze
npm install

# Copia il file .env
cp .env.example .env
```

### Sviluppo

```bash
# Avvia il server in modalità watch
npm run start:dev

# Esegui i test
npm test

# Genera coverage
npm run test:cov
```

### Build

```bash
# Build per la produzione
npm run build

# Avvia il bundle prodotto
npm run start:prod
```

### Lint e Formato

```bash
# Lint il codice
npm run lint

# Formatta il codice
npm run format
```

## 💡 Esempio di Utilizzo

```typescript
import { PurchaseWorkflow } from '@workflows/purchase-workflow.service';

// Avvia il workflow
const state = await workflow.start({
  userId: 'user-123',
  preferences: {
    budgetMin: 200000,
    budgetMax: 500000,
    location: 'Milano',
  },
});

// Fase 1: Ricerca
const searchResult = await workflow.search(userId, {
  location: 'Milano',
  budgetMin: 200000,
  budgetMax: 500000,
});

// Fase 2: Valutazione
const evaluation = await workflow.evaluate(userId, property);

// Fase 3: Negoziazione
const negotiation = await workflow.negotiate(userId, property);

// Fase 4: Documentazione
const documentation = await workflow.manageDocumentation(
  userId,
  'apartment',
  'Lombardia'
);

// Completa il workflow
await workflow.complete(userId);
```

## 🔧 Configurazione

### Variabili Ambiente (.env)

```env
# API Keys
PROPERTY_API_KEY=your_api_key_here
MARKET_DATA_API_KEY=your_api_key_here

# LLM Configuration
OPENAI_API_KEY=your_openai_key_here
LLM_MODEL=gpt-4

# Application
APP_ENV=development
APP_DEBUG=true
LOG_LEVEL=DEBUG
```

## 📡 API Endpoints (Coming Soon)

```
POST   /workflow/start                  # Avvia workflow
POST   /workflow/:id/search             # Ricerca proprietà
POST   /workflow/:id/evaluate           # Valuta proprietà
POST   /workflow/:id/negotiate          # Negozia
POST   /workflow/:id/documentation      # Gestisci docs
GET    /workflow/:id/state              # Ottieni stato
GET    /workflow/:id/history            # Ottieni cronologia
```

## 📚 Documentazione

- [ARCHITECTURE.md](./docs/ARCHITECTURE.md) - Architettura dettagliata
- [PHASES.md](./docs/PHASES.md) - Fasi del processo
- [API.md](./docs/API.md) - Documentazione API (Coming Soon)

## 🧪 Testing

```bash
# Esegui tutti i test
npm test

# Esegui test in watch mode
npm test:watch

# Esegui test con coverage
npm test:cov

# Test con debug
npm run test:debug
```

## 🤝 Contribuire

Le pull request sono benvenute! Per cambiamenti maggiori, apri prima un issue per discutere le modifiche.

## 📄 Licenza

MIT - Vedi [LICENSE](./LICENSE) per i dettagli

## 👥 Team

DomusAI Team

---

**Made with ❤️ for simplified home buying**
