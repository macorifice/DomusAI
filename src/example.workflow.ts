/**
 * Esempio di utilizzo completo del workflow DomusAI
 * This file demonstrates how to use the DomusAI workflow
 */

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PurchaseWorkflow } from '@workflows/purchase-workflow.service';
import { Property } from '@models/types';

async function demonstrateWorkflow() {
  const app = await NestFactory.create(AppModule);

  const workflow = app.get(PurchaseWorkflow);

  // 1. Avvia il workflow
  console.log('\n🏠 Avvio del workflow DomusAI...\n');
  const userId = 'user-demo-001';

  const state = await workflow.start({
    userId,
    preferences: {
      budget: '200k-500k',
      location: 'Milano',
      preferenceType: 'apartment',
    },
  });

  console.log('✅ Workflow avviato');
  console.log(`Fase attuale: ${state.phase}\n`);

  // 2. Fase SEARCH
  console.log('🔍 FASE 1: RICERCA DI PROPRIETÀ\n');
  const searchResult = await workflow.search(userId, {
    location: 'Milano',
    budgetMin: 250000,
    budgetMax: 450000,
    propertyType: 'apartment',
    rooms: 3,
  });

  if (searchResult.status === 'success') {
    console.log(`✅ Trovate ${(searchResult.data as any).total} proprietà`);
    console.log(`⏱️ Tempo di ricerca: ${(searchResult.data as any).searchTime}ms\n`);

    // Prendi la prima proprietà per continuare il workflow
    const selectedProperty = ((searchResult.data as any).properties as Property[])[0];

    if (selectedProperty) {
      console.log(`📍 Proprietà selezionata: ${selectedProperty.address}`);
      console.log(`💰 Prezzo: €${selectedProperty.price.toLocaleString('it-IT')}`);
      console.log(`📐 Area: ${selectedProperty.area} m²\n`);

      // 3. Fase EVALUATION
      console.log('📊 FASE 2: VALUTAZIONE PROPRIETÀ\n');
      const evaluationResult = await workflow.evaluate(userId, selectedProperty);

      if (evaluationResult.status === 'success') {
        const evaluation = (evaluationResult.data as any);
        console.log(`✅ Valutazione completata`);
        console.log(`📈 Valore stimato: €${evaluation.estimatedValue.toLocaleString('it-IT')}`);
        console.log(`💵 Prezzo per m²: €${evaluation.pricePerSqm}`);
        console.log(`📊 Scostamento dal mercato: ${evaluation.priceDeviation > 0 ? '+' : ''}${evaluation.priceDeviation}%`);
        console.log(`🎯 Punteggio investimento: ${evaluation.investmentScore}/100\n`);
        console.log('💡 Raccomandazioni:');
        evaluation.recommendations.forEach((rec: string) => console.log(`   ${rec}`));
        console.log();

        // 4. Fase NEGOTIATION
        console.log('💼 FASE 3: NEGOZIAZIONE\n');
        const negotiationResult = await workflow.negotiate(userId, selectedProperty);

        if (negotiationResult.status === 'success') {
          const negotiation = (negotiationResult.data as any);
          console.log(`✅ Strategia di negoziazione generata`);
          console.log(`🎯 Strategia: ${negotiation.strategyType.toUpperCase()}`);
          console.log(`💰 Prima offerta suggerita: €${negotiation.suggestedFirstOffer.toLocaleString('it-IT')}`);
          console.log(`📊 Range accettabile: €${negotiation.acceptableRange.min.toLocaleString('it-IT')} - €${negotiation.acceptableRange.max.toLocaleString('it-IT')}`);
          console.log(`🏁 Prezzo stimato di chiusura: €${negotiation.estimatedClosingPrice.toLocaleString('it-IT')}`);
          console.log(`⏰ Timeline: ${negotiation.timeline}`);
          console.log(`📈 Probabilità di successo: ${negotiation.successProbability}%\n`);

          console.log('📋 Step di negoziazione:');
          negotiation.negotiationSteps.forEach((step: any) => {
            console.log(`\n   Step ${step.step}: ${step.action}`);
            if (step.expectedPrice) {
              console.log(`   Prezzo previsto: €${step.expectedPrice.toLocaleString('it-IT')}`);
            }
            console.log(`   Punti di negoziazione:`);
            step.negotiationPoints.forEach((point: string) => console.log(`      • ${point}`));
          });

          console.log(`\n💡 Consigli di negoziazione:`);
          negotiation.tips.forEach((tip: string) => console.log(`   ${tip}`));
          console.log();

          // 5. Fase DOCUMENTATION
          console.log('📄 FASE 4: GESTIONE DOCUMENTAZIONE\n');
          const documentationResult = await workflow.manageDocumentation(
            userId,
            'apartment',
            'Lombardia',
            ['Certificato di proprietà', 'Planimetria'],
          );

          if (documentationResult.status === 'success') {
            const docs = (documentationResult.data as any);
            console.log(`✅ Checklist documentazione creata`);
            console.log(`📊 Completamento: ${docs.completionPercentage}%\n`);
            console.log(`📋 Documenti richiesti: ${docs.requiredDocuments.length}`);
            console.log(`✅ Documenti forniti: ${docs.providedDocuments.length}`);
            console.log(`❌ Documenti mancanti: ${docs.missingDocuments.length}\n`);

            if (docs.missingDocuments.length > 0) {
              console.log('⚠️ Documenti mancanti:');
              docs.missingDocuments.forEach((doc: string) => console.log(`   • ${doc}`));
              console.log();
            }

            console.log('📌 Prossimi step:');
            docs.nextSteps.forEach((step: string) => console.log(`   ${step}`));
          }
        }
      }
    }
  }

  // 6. Completa il workflow
  console.log('\n\n✨ WORKFLOW COMPLETATO ✨\n');
  const finalState = await workflow.complete(userId);
  console.log(`Stato finale: ${finalState.phase}`);

  // Mostra le statistiche
  const progress = await workflow.getProgress(userId);
  console.log(`\n📊 Statistiche workflow:`);
  console.log(`Total fasi completate: ${progress.filter((p) => p.status === 'completed').length}`);
  console.log(`Timeline totale: ${progress.length} eventi registrati`);

  console.log('\n✅ Demo completata!\n');

  await app.close();
}

// Uncomment to run this demo
// demonstrateWorkflow().catch(console.error);

export { demonstrateWorkflow };
