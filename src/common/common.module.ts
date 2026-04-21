/**
 * Modulo Comune - Servizi specializzati per le diverse fasi
 */

import { Module } from '@nestjs/common';
import { SearchService } from './search.service';
import { EvaluationService } from './evaluation.service';
import { NegotiationService } from './negotiation.service';

@Module({
  providers: [SearchService, EvaluationService, NegotiationService],
  exports: [SearchService, EvaluationService, NegotiationService],
})
export class CommonModule {}
