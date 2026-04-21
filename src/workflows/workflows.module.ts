/**
 * Modulo Workflows
 */

import { Module } from '@nestjs/common';
import { PurchaseWorkflow } from './purchase-workflow.service';
import { AgentsModule } from '@agents/agents.module';
import { WorkflowsController } from './workflows.controller';

@Module({
  imports: [AgentsModule],
  providers: [PurchaseWorkflow],
  controllers: [WorkflowsController],
  exports: [PurchaseWorkflow],
})
export class WorkflowsModule {}
