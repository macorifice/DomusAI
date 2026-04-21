# Componenti Specializzati - DomusAI

Questo documento descrive i componenti specializzati sviluppati per le diverse fasi dell'acquisto della casa.

## 📁 Struttura

```
src/
├── common/
│   ├── dtos.ts                  # Data Transfer Objects per validazione
│   ├── search.service.ts        # Servizio specializzato per ricerca
│   ├── evaluation.service.ts    # Servizio specializzato per valutazione
│   ├── negotiation.service.ts   # Servizio specializzato per negoziazione
│   ├── logger.ts                # Utility di logging
│   ├── common.module.ts         # NestJS module
│   └── index.ts                 # Esportazioni
```

## 🔍 SearchService

Gestisce la ricerca intelligente di proprietà immobiliari.

### Utilizzo

```typescript
import { SearchService } from '@common/search.service';

constructor(private readonly searchService: SearchService) {}

// Ricerca proprietà
const result = await this.searchService.search({
  location: 'Milano',
  budgetMin: 200000,
  budgetMax: 500000,
  propertyType: 'apartment',
  rooms: 3,
  bathrooms: 2,
  amenities: ['parking', 'terrace'],
  radius: 15, // km
});

console.log(`Found ${result.total} properties`);
console.log(`Search time: ${result.searchTime}ms`);
```

### Caratteristiche

- ✅ Filtraggio multi-criterio
- ✅ Ranking per rilevanza (prezzo + location)
- ✅ Support per amenities
- ✅ Tracking performance

### Output

```typescript
interface SearchResult {
  total: number;
  properties: Property[];
  appliedFilters: SearchFilters;
  searchTime: number;
}
```

---

## 📊 EvaluationService

Valuta le proprietà basandosi su dati di mercato e analisi.

### Utilizzo

```typescript
import { EvaluationService } from '@common/evaluation.service';

constructor(private readonly evaluationService: EvaluationService) {}

// Valuta una proprietà
const evaluation = await this.evaluationService.evaluate(property);

console.log(`Estimated value: €${evaluation.estimatedValue}`);
console.log(`Price deviation: ${evaluation.priceDeviation}%`);
console.log(`Investment score: ${evaluation.investmentScore}/100`);
```

### Caratteristiche

- ✅ Calcolo prezzo per m²
- ✅ Valutazione condizioni (excellent, good, fair, poor)
- ✅ Potenziale di apprezzamento
- ✅ Analisi dei rischi
- ✅ Generazione raccomandazioni
- ✅ Punteggio di investimento

### Output

```typescript
interface PropertyEvaluation {
  propertyId: string;
  address: string;
  askingPrice: number;
  estimatedValue: number;
  pricePerSqm: number;
  marketPricePerSqm: number;
  priceDeviation: number; // %
  valuation: {
    condition: 'excellent' | 'good' | 'fair' | 'poor';
    potential: 'high' | 'medium' | 'low';
    demand: 'high' | 'medium' | 'low';
  };
  risks: Record<string, string>;
  recommendations: string[];
  investmentScore: number; // 1-100
}
```

### Fattori di Valutazione

1. **Prezzo per m²** - Comparato con media di mercato
2. **Età della proprietà** - Influenza il valore
3. **Amenities** - Parcheggio, terrazza, ascensore, etc.
4. **Condizioni strutturali** - Base su anno di costruzione
5. **Domanda di mercato** - Per location specifica
6. **Potenziale di apprezzamento** - Trend di mercato

---

## 💼 NegotiationService

Genera strategie di negoziazione intelligenti.

### Utilizzo

```typescript
import { NegotiationService } from '@common/negotiation.service';

constructor(private readonly negotiationService: NegotiationService) {}

// Genera strategia di negoziazione
const strategy = await this.negotiationService.generateStrategy(
  property,
  marketValue
);

console.log(`Strategy: ${strategy.strategyType}`);
console.log(`First offer: €${strategy.suggestedFirstOffer}`);
console.log(`Timeline: ${strategy.timeline}`);
```

### Tipi di Strategia

1. **AGGRESSIVE** - Prezzo significativamente sopra il mercato
   - Prima offerta: -18% dal prezzo richiesto
   - Range: Aggressive
   - Timeline: 7-14 giorni

2. **BALANCED** - Prezzo ragionevole
   - Prima offerta: -10% dal prezzo richiesto
   - Range: Equilibrato
   - Timeline: 10-20 giorni

3. **CONSERVATIVE** - Prezzo già vantaggioso
   - Prima offerta: -4% dal prezzo richiesto
   - Range: Conservatore
   - Timeline: 5-10 giorni

### Output

```typescript
interface NegotiationStrategy {
  propertyId: string;
  initialPrice: number;
  suggestedFirstOffer: number;
  acceptableRange: {
    min: number;
    max: number;
  };
  strategyType: 'aggressive' | 'balanced' | 'conservative';
  negotiationSteps: NegotiationStep[];
  estimatedClosingPrice: number;
  timeline: string;
  successProbability: number; // 0-100
  tips: string[];
}

interface NegotiationStep {
  step: number;
  action: string;
  expectedPrice?: number;
  negotiationPoints: string[];
}
```

### Consigli di Negoziazione

- Pre-approvazione ipotecaria
- Raccolta dati su proprietà simili
- Documentazione di tutte le comunicazioni
- Utilizzo di ispezioni tecniche come leva
- Disponibilità a compromessi su termini

---

## 📝 DTOs (Data Transfer Objects)

Gli input sono validati tramite class-validator:

```typescript
import { SearchPropertyDto, UserProfileDto } from '@common/dtos';

@Post('/search')
async search(@Body() dto: SearchPropertyDto) {
  // Validazione automatica
  // Se fallisce, ritorna 400 Bad Request
}
```

### DTOs Disponibili

- **SearchPropertyDto** - Criteri di ricerca
- **UserProfileDto** - Profilo acquirente
- **PropertyEvaluationDto** - Proprietà da valutare
- **NegotiationDto** - Parametri negoziazione
- **DocumentationDto** - Dati documentazione

---

## 🔧 Logger Utility

Logging semplice ma efficace:

```typescript
import { Logger } from '@common/logger';

const logger = new Logger('MyService');

logger.log('Informational message');
logger.debug('Debug detail');
logger.warn('Warning message');
logger.error('Error message', error);
```

---

## 🏗️ Integrazione negli Agenti

Gli agenti utilizzano questi servizi tramite dependency injection:

```typescript
@Injectable()
export class SearchAgent extends BaseAgent {
  constructor(private readonly searchService: SearchService) {
    super('SearchAgent', 'Ricerca proprietà');
  }

  async execute(input: Record<string, any>) {
    const result = await this.searchService.search(input);
    return {
      status: 'success',
      data: result,
      timestamp: new Date(),
    };
  }
}
```

---

## 🎯 Flusso Completo

```
1. SEARCH
   → SearchService.search()
   → Filtering + Ranking
   → SearchAgent.execute()

2. EVALUATION
   → EvaluationService.evaluate()
   → Price Analysis + Risk Assessment
   → EvaluationAgent.execute()

3. NEGOTIATION
   → NegotiationService.generateStrategy()
   → Strategy Selection + Steps Generation
   → NegotiationAgent.execute()

4. DOCUMENTATION
   → DocumentationAgent.execute()
   → Checklist Generation
```

---

## 📊 Dati Mock

I servizi includono dati mock per demo/testing:

- 5 proprietà di esempio a Milano
- Prezzi realistici (280k - 550k)
- Varietà di tipi e amenities
- Posizioni diverse in Milano

Per connettere a veri database immobiliari:

1. Implementare adapter in `PropertyLocator`
2. Integrare API esterne (Immobiliare.it, Idealista, ecc.)
3. Caching dei risultati

---

## 🚀 Prossimi Sviluppi

- [ ] Integrazione API immobiliari esterne
- [ ] Machine learning per valutazioni più accurate
- [ ] Historical data tracking per trend analysis
- [ ] Price prediction models
- [ ] Multi-market support
- [ ] Comparative market analysis
- [ ] Blockchain per documentazione
- [ ] AI-powered recommendations
