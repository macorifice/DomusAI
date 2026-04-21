/**
 * Modulo Workflows
 */

import { Module } from '@nestjs/common';
import { PurchaseWorkflow } from './purchase-workflow.service';
import { AgentsModule } from '@agents/agents.module';

@Module({
  imports: [AgentsModule],
  providers: [PurchaseWorkflow],
  exports: [PurchaseWorkflow],
})
export class WorkflowsModule {}
