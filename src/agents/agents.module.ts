/**
 * Modulo degli Agenti
 */

import { Module } from '@nestjs/common';
import { SearchAgent } from './search.agent';
import { EvaluationAgent } from './evaluation.agent';
import { NegotiationAgent } from './negotiation.agent';
import { DocumentationAgent } from './documentation.agent';
import { ToolsModule } from '@tools/tools.module';
import { CommonModule } from '@common/common.module';

@Module({
  imports: [ToolsModule, CommonModule],
  providers: [SearchAgent, EvaluationAgent, NegotiationAgent, DocumentationAgent],
  exports: [SearchAgent, EvaluationAgent, NegotiationAgent, DocumentationAgent],
})
export class AgentsModule {}
