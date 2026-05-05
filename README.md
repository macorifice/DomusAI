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
- **Backend**: NestJS
- **Frontend**: Next.js (App Router, TypeScript) in `frontend/`
- **Linguaggio**: TypeScript
- **Testing**: Jest
- **Build**: TypeScript Compiler

## 📁 Struttura del Progetto

```
domusai/
├── frontend/               # UI Next.js App Router
│   ├── src/app
│   └── src/lib
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
npm install --prefix frontend

# Copia il file .env
cp .env.example .env
```

### Sviluppo

```bash
# Avvia backend + frontend
npm run start:dev:all

# Oppure solo backend
npm run start:dev

# Esegui i test
npm test

# Genera coverage
npm run test:cov
```

### Build

```bash
# Build backend
npm run build

# Build frontend
npm run build:frontend

# Build completo
npm run build:all

# Avvia backend in produzione
npm run start:prod
```

### Lint e Formato

```bash
# Lint il codice
npm run lint

# Lint frontend
npm run lint:frontend

# Formatta il codice
npm run format
```

### URL locali

- Frontend Next.js: `http://localhost:3001`
- API NestJS: `http://localhost:3000`

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
IDEALISTA_API_KEY=your_idealista_api_key
IMMOBILIARE_API_KEY=your_immobiliare_api_key
CASA_IT_API_KEY=your_casa_it_api_key
MARKET_DATA_API_KEY=your_api_key_here

# API URLs
IDEALISTA_API_URL=https://api.idealista.com
IMMOBILIARE_API_URL=https://api.immobiliare.it
CASA_IT_API_URL=https://api.casa.it

# LLM Configuration
OPENAI_API_KEY=your_openai_key_here
LLM_MODEL=gpt-4

# Application
APP_ENV=development
APP_DEBUG=true
LOG_LEVEL=DEBUG
LISTING_CACHE_TTL_MS=300000

# Supabase checklist persistence
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### Variabili Frontend (`frontend/.env.local`)

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
```

## 📡 API Endpoints

```
POST   /workflow/start                  # Avvia workflow
POST   /workflow/:id/search             # Ricerca proprietà
POST   /workflow/:id/evaluate           # Valuta proprietà
POST   /workflow/:id/negotiate          # Negozia
POST   /workflow/:id/documentation      # Gestisci docs
GET    /workflow/:id/state              # Ottieni stato
GET    /workflow/:id/history            # Ottieni cronologia
POST   /properties/search               # Ricerca proprietà (Property Locator MVP)
GET    /properties/:id                  # Dettaglio proprietà
```

### Ricerca avanzata (nuovo payload)

`/workflow/:id/search` e `/properties/search` supportano anche:

- `maxPricePerSqm`: soglia massima di prezzo al mq
- `maxRenovatedPrice`: soglia massima se immobile ristrutturato
- `maxToRenovatePrice`: soglia massima se immobile da ristrutturare

La risposta include:

- `cache`: `hit` o `miss`
- `rulesEvaluation`: esito regole condizionali per annuncio
- `market`: posizionamento rispetto al prezzo medio di zona + hint negoziale

## 📚 Documentazione

- [ARCHITECTURE.md](./docs/ARCHITECTURE.md) - Architettura dettagliata
- [PHASES.md](./docs/PHASES.md) - Fasi del processo
- [API.md](./docs/API.md) - Documentazione API

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
