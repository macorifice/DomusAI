# API DomusAI

Documentazione degli endpoint disponibili per il workflow di acquisto e per il modulo `Property Locator`.

## Base URL

`http://localhost:3000`

## Workflow

### Avvia workflow

- `POST /workflow/start`

Request:

```json
{
  "userId": "user-123",
  "preferences": {
    "budgetMin": 200000,
    "budgetMax": 500000,
    "location": "Milano"
  }
}
```

### Ricerca nel workflow

- `POST /workflow/:id/search`

Request:

```json
{
  "location": "Milano",
  "budgetMin": 200000,
  "budgetMax": 500000,
  "propertyType": "apartment",
  "rooms": 3,
  "bathrooms": 2,
  "maxPricePerSqm": 3000,
  "maxRenovatedPrice": 250000,
  "maxToRenovatePrice": 200000
}
```

### Stato e cronologia workflow

- `GET /workflow/:id/state`
- `GET /workflow/:id/history`

## Property Locator MVP

### Ricerca proprietà

- `POST /properties/search`

Request:

```json
{
  "location": "Milano",
  "budgetMin": 250000,
  "budgetMax": 450000,
  "propertyType": "apartment",
  "rooms": 2,
  "bathrooms": 1,
  "radius": 10,
  "amenities": ["parking"],
  "maxPricePerSqm": 3000,
  "maxRenovatedPrice": 250000,
  "maxToRenovatePrice": 200000
}
```

Response:

```json
{
  "total": 2,
  "cache": "miss",
  "properties": [
    {
      "id": "idealista-id-001",
      "source": "idealista",
      "address": "Via Roma, 123, Milano",
      "price": 350000,
      "pricePerSqm": 2917,
      "area": 120,
      "rooms": 3,
      "bathrooms": 2,
      "propertyType": "apartment",
      "rulesEvaluation": {
        "listingId": "idealista-id-001",
        "pass": true,
        "outcomes": []
      },
      "market": {
        "zoneAvgPricePerSqm": 3050,
        "deltaPct": -4.36,
        "marketPosition": "fair_market",
        "negotiationHint": "Prezzo in linea col mercato: negoziazione graduale e focus su condizioni."
      }
    }
  ]
}
```

### Dettaglio proprietà

- `GET /properties/:id`

Response `200`:

```json
{
  "id": "prop-001",
  "address": "Via Roma, 123, Milano",
  "price": 350000,
  "area": 120,
  "rooms": 3,
  "bathrooms": 2,
  "propertyType": "apartment"
}
```

Response `404`:

```json
{
  "statusCode": 404,
  "message": "Proprieta' non trovata: missing-id",
  "error": "Not Found"
}
```
