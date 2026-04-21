# TypeScript Configuration Guide

## Setup Iniziale

### 1. Installare NestJS CLI (Opzionale)
```bash
npm install -g @nestjs/cli

# Inizializzare un nuovo progetto NestJS (facoltativo)
# nest new domusai
```

### 2. Installare Dipendenze
```bash
npm install
```

## Compilazione

### Development
```bash
# Watch mode - ricompila automaticamente al salvataggio
npm run start:dev

# Build singolo
npm run build
```

### Production
```bash
# Build ottimizzato
npm run build

# Avvia il bundle
npm run start:prod
```

## Testing

### Eseguire Test
```bash
# Tutti i test
npm test

# Watch mode
npm test:watch

# Con coverage
npm test:cov
```

### Struttura Test
```
test/
├── agents.spec.ts
└── workflow.spec.ts
```

## Linting e Formattazione

### ESLint
```bash
# Controlla errori
npm run lint

# Correggi automaticamente
npm run lint -- --fix
```

### Prettier
```bash
# Formatta il codice
npm run format
```

## Path Aliases

Configurati in `tsconfig.json`:

```typescript
import { SearchAgent } from '@agents/search.agent';
import { Property } from '@models/types';
import { PropertyLocator } from '@tools/property-locator.service';
import { PurchaseWorkflow } from '@workflows/purchase-workflow.service';
```

Invece di:
```typescript
import { SearchAgent } from '../../agents/search.agent';
```

## Struttura Directory

```
src/
├── agents/                    # Agenti specializzati
│   ├── base.agent.ts         # Classe base
│   ├── search.agent.ts
│   ├── evaluation.agent.ts
│   ├── negotiation.agent.ts
│   ├── documentation.agent.ts
│   └── agents.module.ts      # NestJS Module
├── workflows/                # Orchestrazione
│   ├── purchase-workflow.service.ts
│   └── workflows.module.ts
├── tools/                    # Servizi specializzati
│   ├── property-locator.service.ts
│   ├── market-analyzer.service.ts
│   ├── document-checker.service.ts
│   └── tools.module.ts
├── models/                   # Interfacce e tipi
│   └── types.ts
├── common/                   # Utilità condivise
├── app.module.ts            # Module principale
└── main.ts                  # Entry point
```

## Aggiungere Nuovi Agenti

1. Creare file `src/agents/my-agent.ts`:
```typescript
import { Injectable } from '@nestjs/common';
import { BaseAgent } from './base.agent';

@Injectable()
export class MyAgent extends BaseAgent {
  constructor() {
    super('MyAgent', 'Descrizione dell\'agente');
  }

  async execute(input: Record<string, any>) {
    // Implementazione
  }
}
```

2. Registrare in `agents.module.ts`:
```typescript
@Module({
  providers: [MyAgent, ...],
  exports: [MyAgent, ...],
})
export class AgentsModule {}
```

3. Iniettare nel workflow:
```typescript
constructor(
  private readonly myAgent: MyAgent,
) {}
```

## Dipendenze Principali

```json
{
  "@nestjs/common": "^10.3.0",
  "@nestjs/core": "^10.3.0",
  "reflect-metadata": "^0.1.13",
  "rxjs": "^7.8.1",
  "class-validator": "^0.14.0"
}
```

## Variabili d'Ambiente

Copia `.env.example` in `.env`:
```bash
cp .env.example .env
```

Configura le variabili necessarie:
- `NODE_ENV`: development/production
- `LOG_LEVEL`: DEBUG/INFO/WARNING/ERROR
- API keys per servizi esterni

## IDE Setup

### VSCode
1. Installa "ES7+ React/Redux/React-Native snippets"
2. Installa "TypeScript Vue Plugin (Volar)"
3. Configura TypeScript version in VSCode:
   - Cmd+Shift+P → "TypeScript: Select TypeScript Version"
   - Scegli "Use Workspace Version"

### Estensioni Consigliate
- Prettier - Code formatter
- ESLint
- NestJS Files
- Thunder Client or REST Client

## Debug

### VS Code Debug Configuration

Crea `.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Jest current file",
      "program": "${workspaceFolder}/node_modules/.bin/jest",
      "args": ["${file}", "--runInBand"],
      "console": "integratedTerminal"
    }
  ]
}
```

## Troubleshooting

### `Cannot find module '@agents/...'`
- Verifica i path aliases in `tsconfig.json`
- Assicurati che i file siano compilati: `npm run build`

### Type errors non previsti
- Esegui `npm run build` per verificare tutti gli errori
- Verifica `tsconfig.json` per le opzioni di strictness

### Test falliti
- Verifica che il jest.config.js abbia i path aliases corretti
- Usa `npm test -- --verbose` per debug

## Performance Tips

1. **Lazy Loading**: Carica agenti solo quando necessari
2. **Caching**: Implementa cache per API esterne
3. **Parallelizzazione**: Esegui agenti in parallelo quando possibile
4. **Connection Pooling**: Usa connection pool per database

## Deployment

### Docker
Crea un `Dockerfile`:
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist .
EXPOSE 3000
CMD ["node", "main.js"]
```

### Build and Run
```bash
npm run build
docker build -t domusai .
docker run -p 3000:3000 domusai
```
